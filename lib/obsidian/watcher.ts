// lib/obsidian/watcher.ts
import chokidar from 'chokidar'
import { parseObsidianNote } from './parser'
import { prisma } from '@/lib/prisma'

const watcher = chokidar.watch('./vault/03-SKILLS', {
  ignored: /(^|[\/\\])\../,
  persistent: true,
})

watcher
  .on('all', async (event, path) => {
    if (!['add', 'change', 'unlink'].includes(event)) return
    
    const note = parseObsidianNote(await fs.readFile(path, 'utf8'))
    
    if (note.prisma_sync !== true) return

    await prisma.skill.upsert({
      where: { id: note.id },
      create: {
        id: note.id,
        name: note.title,
        category: note.category,
        content: note.body,
        tags: note.tags,
        version: note.version,
        status: note.status,
      },
      update: {
        content: note.body,
        tags: note.tags,
        version: note.version,
        updatedAt: new Date(),
      },
    })
  })
