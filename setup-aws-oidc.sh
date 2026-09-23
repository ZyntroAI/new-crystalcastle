#!/usr/bin/env bash
#
# setup-aws-oidc.sh
#
# ตั้งค่า AWS IAM OIDC Identity Provider + IAM Role สำหรับให้ GitHub Actions
# ของ repo 1napz/crystalcastle เชื่อมต่อ AWS แบบ OIDC (ไม่มี long-lived
# access key เก็บไว้ใน GitHub Secrets เลย)
#
# ข้อกำหนดก่อนรัน:
#   - ติดตั้งและ authenticate AWS CLI แล้ว (aws configure หรือ SSO)
#   - สิทธิ์ IAM เพียงพอในการสร้าง OIDC provider และ IAM role
#
# วิธีใช้:
#   AWS_ACCOUNT_ID=123456789012 AWS_REGION=ap-southeast-1 ./setup-aws-oidc.sh
#
set -euo pipefail

: "${AWS_ACCOUNT_ID:?กรุณาระบุ AWS_ACCOUNT_ID เช่น AWS_ACCOUNT_ID=123456789012 ./setup-aws-oidc.sh}"
: "${AWS_REGION:=ap-southeast-1}"

ROLE_NAME="crystalcastle-github-actions-deploy"
OIDC_URL="https://token.actions.githubusercontent.com"
OIDC_AUDIENCE="sts.amazonaws.com"

# ค่า thumbprint ปัจจุบันของ GitHub OIDC (สองค่า สำหรับรองรับช่วงหมุนเวียน
# ใบรับรอง) — หากสร้าง provider แล้วเจอ error เรื่อง thumbprint ในอนาคต
# ให้ตรวจสอบค่าล่าสุดจาก AWS/GitHub docs อีกครั้งก่อนรัน
THUMBPRINT_1="6938fd4d98bab03faadb97b34396831e3780aea1"
THUMBPRINT_2="1c58a3a8518e8759bf075b76b750d4f2df264fcd"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> ตรวจสอบว่ามี OIDC provider สำหรับ GitHub อยู่แล้วหรือยัง..."
EXISTING_PROVIDER_ARN="$(
  aws iam list-open-id-connect-providers \
    --query "OpenIDConnectProviderList[?contains(Arn, 'token.actions.githubusercontent.com')].Arn" \
    --output text
)"

if [[ -n "${EXISTING_PROVIDER_ARN}" ]]; then
  echo "    พบ provider เดิมอยู่แล้ว: ${EXISTING_PROVIDER_ARN}"
  PROVIDER_ARN="${EXISTING_PROVIDER_ARN}"
else
  echo "==> สร้าง OIDC Identity Provider ใหม่สำหรับ GitHub Actions..."
  PROVIDER_ARN="$(
    aws iam create-open-id-connect-provider \
      --url "${OIDC_URL}" \
      --client-id-list "${OIDC_AUDIENCE}" \
      --thumbprint-list "${THUMBPRINT_1}" "${THUMBPRINT_2}" \
      --query "OpenIDConnectProviderArn" \
      --output text
  )"
  echo "    สร้างสำเร็จ: ${PROVIDER_ARN}"
fi

echo "==> เตรียม trust-policy.json (แทนที่ <AWS_ACCOUNT_ID> ด้วยค่าจริง)..."
TMP_TRUST_POLICY="$(mktemp)"
sed "s/<AWS_ACCOUNT_ID>/${AWS_ACCOUNT_ID}/g" "${SCRIPT_DIR}/trust-policy.json" > "${TMP_TRUST_POLICY}"

echo "==> สร้างหรืออัปเดต IAM Role '${ROLE_NAME}'..."
if aws iam get-role --role-name "${ROLE_NAME}" >/dev/null 2>&1; then
  echo "    พบ role เดิมอยู่แล้ว — อัปเดต trust policy..."
  aws iam update-assume-role-policy \
    --role-name "${ROLE_NAME}" \
    --policy-document "file://${TMP_TRUST_POLICY}"
else
  aws iam create-role \
    --role-name "${ROLE_NAME}" \
    --assume-role-policy-document "file://${TMP_TRUST_POLICY}" \
    --description "OIDC role สำหรับ GitHub Actions ของ 1napz/crystalcastle (ไม่มี long-lived credentials)"
fi

echo "==> เตรียม permission-policy.json (แทนที่ placeholder ด้วยค่าจริง)..."
TMP_PERMISSION_POLICY="$(mktemp)"
sed \
  -e "s/<AWS_ACCOUNT_ID>/${AWS_ACCOUNT_ID}/g" \
  -e "s/<AWS_REGION>/${AWS_REGION}/g" \
  "${SCRIPT_DIR}/permission-policy.json" > "${TMP_PERMISSION_POLICY}"

echo "==> แนบ permission policy เข้ากับ role (inline policy)..."
echo "    หมายเหตุ: permission-policy.json เป็นเพียงตัวอย่าง (push ECR + deploy"
echo "    ECS) กรุณาแก้ไขให้ตรงกับสิ่งที่ CrystalCastle deploy จริงก่อนใช้งานจริง"
aws iam put-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-name "crystalcastle-deploy-permissions" \
  --policy-document "file://${TMP_PERMISSION_POLICY}"

rm -f "${TMP_TRUST_POLICY}" "${TMP_PERMISSION_POLICY}"

ROLE_ARN="$(aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.Arn' --output text)"

echo ""
echo "=========================================================="
echo " ตั้งค่าเสร็จสมบูรณ์"
echo "=========================================================="
echo " OIDC Provider ARN : ${PROVIDER_ARN}"
echo " IAM Role ARN       : ${ROLE_ARN}"
echo ""
echo " นำค่า Role ARN ด้านบนไปใส่ใน .github/workflows/aws-oidc-deploy.yml"
echo " ที่ตัวแปร role-to-assume (ไม่ต้องเก็บ AWS Access Key เป็น Secret เลย)"
echo "=========================================================="
