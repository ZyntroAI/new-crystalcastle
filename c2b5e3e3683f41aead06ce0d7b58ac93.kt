package com.zyntroai.filemanager

import android.content.Context
import android.net.Uri
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.security.SecureRandom
import java.security.spec.KeySpec
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import java.security.MessageDigest

/**
 * SecretVault — AES-256-GCM encrypted file vault, PIN-protected.
 * 100% offline. Files are stored encrypted in app-private storage;
 * original filenames are hidden (encrypted metadata).
 *
 * Flow: setupPin() -> unlock() returns master key -> import/list/decrypt/delete.
 * Key is held in memory only while unlocked; cleared on lock().
 */
object SecretVault {

    data class VaultEntry(
        val id: String,        // uuid, also the stored filename <id>.enc
        val originalName: String,
        val sizeBytes: Long,
        val mimeType: String,
        val storedAt: Long
    )

    private const val PREFS = "vault_prefs"
    private const val KEY_PIN_SALT = "pin_salt"
    private const val KEY_PIN_HASH = "pin_hash"
    private const val KEY_MASTER_SALT = "master_salt"
    private const val PBKDF_ITERATIONS = 10_000
    private const val KEY_LENGTH = 256
    private const val GCM_TAG_BITS = 128
    private const val IV_LEN = 12
    private const val SALT_LEN = 16

    @Volatile private var masterKey: SecretKey? = null

    // ---------- Setup / PIN ----------
    fun isVaultCreated(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        return prefs.contains(KEY_PIN_HASH)
    }

    fun isUnlocked(): Boolean = masterKey != null

    fun lock() { masterKey = null }

    fun setupPin(context: Context, pin: String): Boolean {
        if (pin.length < 4) return false
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val pinSalt = randomBytes(SALT_LEN)
        val masterSalt = randomBytes(SALT_LEN)
        val pinHash = sha256(pin.toByteArray() + pinSalt)
        prefs.edit()
            .putString(KEY_PIN_SALT, bytesToHex(pinSalt))
            .putString(KEY_PIN_HASH, bytesToHex(pinHash))
            .putString(KEY_MASTER_SALT, bytesToHex(masterSalt))
            .apply()
        // Create empty encrypted metadata
        masterKey = deriveKey(pin, masterSalt)
        saveMetadata(context, emptyList())
        vaultDir(context).mkdirs()
        return true
    }

    /** Returns true and loads master key if PIN is correct. */
    fun unlock(context: Context, pin: String): Boolean {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val pinSalt = hexToBytes(prefs.getString(KEY_PIN_SALT, "") ?: "")
        val expectedHash = prefs.getString(KEY_PIN_HASH, "") ?: ""
        val actualHash = bytesToHex(sha256(pin.toByteArray() + pinSalt))
        if (actualHash != expectedHash) return false
        val masterSalt = hexToBytes(prefs.getString(KEY_MASTER_SALT, "") ?: "")
        masterKey = deriveKey(pin, masterSalt)
        return true
    }

    fun changePin(context: Context, oldPin: String, newPin: String): Boolean {
        if (!unlock(context, oldPin)) return false
        val entries = listEntries(context) ?: return false
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val pinSalt = randomBytes(SALT_LEN)
        val masterSalt = randomBytes(SALT_LEN)
        val pinHash = sha256(newPin.toByteArray() + pinSalt)
        prefs.edit()
            .putString(KEY_PIN_SALT, bytesToHex(pinSalt))
            .putString(KEY_PIN_HASH, bytesToHex(pinHash))
            .putString(KEY_MASTER_SALT, bytesToHex(masterSalt))
            .apply()
        masterKey = deriveKey(newPin, masterSalt)
        saveMetadata(context, entries) // re-encrypt metadata with new key
        return true
    }

    // ---------- Crypto primitives ----------
    private fun deriveKey(pin: String, salt: ByteArray): SecretKey {
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val spec: KeySpec = PBEKeySpec(pin.toCharArray(), salt, PBKDF_ITERATIONS, KEY_LENGTH)
        val derived = factory.generateSecret(spec).encoded
        return SecretKeySpec(derived, "AES")
    }

    private fun encryptBytes(key: SecretKey, plaintext: ByteArray): ByteArray {
        val iv = randomBytes(IV_LEN)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(GCM_TAG_BITS, iv))
        val ct = cipher.doFinal(plaintext)
        return iv + ct
    }

    private fun decryptBytes(key: SecretKey, data: ByteArray): ByteArray {
        val iv = data.copyOfRange(0, IV_LEN)
        val ct = data.copyOfRange(IV_LEN, data.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(GCM_TAG_BITS, iv))
        return cipher.doFinal(ct)
    }

    // ---------- Metadata (encrypted) ----------
    private fun metaFile(context: Context) = File(context.filesDir, "vault_meta.enc")
    private fun vaultDir(context: Context) = File(context.filesDir, "vault")

    private fun saveMetadata(context: Context, entries: List<VaultEntry>) {
        val key = masterKey ?: return
        val arr = JSONArray()
        entries.forEach { e ->
            arr.put(JSONObject().apply {
                put("id", e.id)
                put("name", e.originalName)
                put("size", e.sizeBytes)
                put("mime", e.mimeType)
                put("time", e.storedAt)
            })
        }
        val enc = encryptBytes(key, arr.toString().toByteArray(Charsets.UTF_8))
        FileOutputStream(metaFile(context)).use { it.write(enc) }
    }

    fun listEntries(context: Context): List<VaultEntry>? {
        val key = masterKey ?: return null
        val f = metaFile(context)
        if (!f.exists()) return emptyList()
        return try {
            val raw = f.readBytes()
            val json = String(decryptBytes(key, raw), Charsets.UTF_8)
            val arr = JSONArray(json)
            List(arr.length()) { i ->
                val o = arr.getJSONObject(i)
                VaultEntry(
                    o.getString("id"),
                    o.getString("name"),
                    o.getLong("size"),
                    o.optString("mime", "*/*"),
                    o.getLong("time")
                )
            }.sortedByDescending { it.storedAt }
        } catch (e: Exception) {
            null
        }
    }

    // ---------- Import / encrypt a file from a content Uri ----------
    fun importFile(context: Context, uri: Uri, originalName: String, mimeType: String): VaultEntry? {
        val key = masterKey ?: return null
        val id = java.util.UUID.randomUUID().toString()
        val outFile = File(vaultDir(context), "$id.enc")
        var size = 0L
        return try {
            val iv = randomBytes(IV_LEN)
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(GCM_TAG_BITS, iv))
            context.contentResolver.openInputStream(uri)?.use { input ->
                FileOutputStream(outFile).use { out ->
                    out.write(iv)
                    val buffer = ByteArray(8192)
                    var read: Int
                    while (input.read(buffer).also { read = it } != -1) {
                        val encChunk = cipher.update(buffer, 0, read)
                        if (encChunk != null) out.write(encChunk)
                        size += read
                    }
                    val final = cipher.doFinal()
                    if (final != null) out.write(final)
                }
            }
            val entry = VaultEntry(id, originalName, size, mimeType, System.currentTimeMillis())
            val current = listEntries(context)?.toMutableList() ?: mutableListOf()
            current.add(entry)
            saveMetadata(context, current)
            entry
        } catch (e: Exception) {
            outFile.delete()
            null
        }
    }

    // ---------- Decrypt to a temp file in cache (for viewing/sharing) ----------
    fun decryptToCache(context: Context, entry: VaultEntry): File? {
        val key = masterKey ?: return null
        val inFile = File(vaultDir(context), "${entry.id}.enc")
        if (!inFile.exists()) return null
        val tempDir = File(context.cacheDir, "vault_temp").apply { mkdirs() }
        val outFile = File(tempDir, entry.originalName)
        return try {
            FileInputStream(inFile).use { fis ->
                val iv = ByteArray(IV_LEN)
                fis.read(iv)
                val cipher = Cipher.getInstance("AES/GCM/NoPadding")
                cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(GCM_TAG_BITS, iv))
                FileOutputStream(outFile).use { fos ->
                    val buffer = ByteArray(8192)
                    var read: Int
                    while (fis.read(buffer).also { read = it } != -1) {
                        val dec = cipher.update(buffer, 0, read)
                        if (dec != null) fos.write(dec)
                    }
                    val final = cipher.doFinal()
                    if (final != null) fos.write(final)
                }
            }
            outFile
        } catch (e: Exception) {
            outFile.delete()
            null
        }
    }

    fun deleteEntry(context: Context, entry: VaultEntry): Boolean {
        val current = listEntries(context)?.toMutableList() ?: return false
        current.removeAll { it.id == entry.id }
        saveMetadata(context, current)
        File(vaultDir(context), "${entry.id}.enc").delete()
        return true
    }

    fun clearTemp(context: Context) {
        File(context.cacheDir, "vault_temp").deleteRecursively()
    }

    // ---------- Utils ----------
    private val secureRandom = SecureRandom()
    private fun randomBytes(n: Int) = ByteArray(n).also { secureRandom.nextBytes(it) }

    private fun sha256(b: ByteArray): ByteArray =
        MessageDigest.getInstance("SHA-256").digest(b)

    private fun bytesToHex(b: ByteArray): String =
        b.joinToString("") { "%02x".format(it) }

    private fun hexToBytes(s: String): ByteArray {
        require(s.length % 2 == 0)
        return ByteArray(s.length / 2) { i ->
            s.substring(2 * i, 2 * i + 2).toInt(16).toByte()
        }
    }
}
