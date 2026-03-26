#!/bin/bash
# ============================================================
# 붉은사막 DB — 초기 환경 세팅 스크립트
# 처음 클론 후 딱 한 번만 실행하세요.
# ============================================================

set -e  # 오류 발생 시 즉시 중단

echo ""
echo "🏜️  붉은사막 DB 초기 세팅 시작"
echo "=================================="

# ──────────────────────────────────────────────
# Step 1: 의존성 설치
# ──────────────────────────────────────────────
echo ""
echo "📦 Step 1: 패키지 설치 중..."
npm install
echo "✅ 패키지 설치 완료"

# ──────────────────────────────────────────────
# Step 2: .env.local 생성
# ──────────────────────────────────────────────
echo ""
echo "🔑 Step 2: 환경변수 파일 확인..."
ENV_FILE="apps/web/.env.local"

if [ -f "$ENV_FILE" ]; then
  echo "⚠️  $ENV_FILE 이미 존재합니다. 건너뜁니다."
else
  cp apps/web/.env.example "$ENV_FILE"
  echo "✅ $ENV_FILE 생성됨"
  echo ""
  echo "  ⚡ 지금 바로 $ENV_FILE 을 열고 아래 값을 채워주세요:"
  echo ""
  echo "  1. Supabase 대시보드 → https://supabase.com/dashboard"
  echo "     - New project 생성 (지역: Northeast Asia / ap-northeast-2)"
  echo "     - Settings > API 에서:"
  echo "       NEXT_PUBLIC_SUPABASE_URL"
  echo "       NEXT_PUBLIC_SUPABASE_ANON_KEY"
  echo "       SUPABASE_SERVICE_ROLE_KEY"
  echo ""
  echo "  2. Settings > Database 에서 Connection String 복사:"
  echo "     - Transaction mode (포트 6543) → DATABASE_URL  (Prisma 커넥션 풀링용)"
  echo "     - Session mode  (포트 5432) → DIRECT_URL     (migrate/seed용)"
  echo "     ⚠️  비밀번호의 특수문자는 URL 인코딩 필요: @ → %40"
  echo ""
  echo "  파일 편집 후 이 스크립트를 다시 실행하거나"
  echo "  아래 Step 3~5를 수동으로 실행하세요."
  echo ""
  exit 0
fi

# ──────────────────────────────────────────────
# Step 3: Prisma 클라이언트 생성
# ──────────────────────────────────────────────
echo ""
echo "⚙️  Step 3: Prisma 클라이언트 생성 중..."
cd packages/db
npx prisma generate
cd ../..
echo "✅ Prisma 클라이언트 생성 완료"

# ──────────────────────────────────────────────
# Step 4: DB 스키마 푸시
# ──────────────────────────────────────────────
echo ""
echo "🗄️  Step 4: DB 스키마 적용 중 (prisma db push)..."
cd packages/db
npx prisma db push
cd ../..
echo "✅ 스키마 적용 완료"

# ──────────────────────────────────────────────
# Step 5: 시드 데이터 입력
# ──────────────────────────────────────────────
echo ""
echo "🌱 Step 5: 시드 데이터 입력 중 (보스 5개 + 아이템)..."
cd packages/db
npx tsx prisma/seed.ts
cd ../..
echo "✅ 시드 완료"

# ──────────────────────────────────────────────
# Step 6: Meilisearch 동기화 (선택)
# ──────────────────────────────────────────────
echo ""
echo "🔍 Step 6: Meilisearch 동기화 안내..."
echo "  Meilisearch 실행:"
echo "    docker run -d -p 7700:7700 -e MEILI_MASTER_KEY=\$MEILISEARCH_API_KEY getmeili/meilisearch:latest"
echo ""
echo "  개발 서버 실행 후 동기화:"
echo "    curl -X POST http://localhost:3000/api/admin/sync-search \\"
echo "         -H 'Authorization: Bearer \$ADMIN_SECRET'"

# ──────────────────────────────────────────────
# Step 7: 헬스체크 안내
# ──────────────────────────────────────────────
echo ""
echo "🎉 세팅 완료!"
echo ""
echo "개발 서버 실행:"
echo "  npm run dev"
echo ""
echo "DB 연결 확인:"
echo "  curl http://localhost:3000/api/health"
echo ""
echo "Prisma Studio (DB GUI):"
echo "  cd packages/db && npx prisma studio"
echo ""
