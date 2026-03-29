import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@red-desert/db'
import type { Character, WeaponType, BuildPlaystyle } from '@red-desert/db'

const VALID_CHARACTERS: Character[] = ['KLIFF', 'DAMIANE', 'OONGKA']
const VALID_WEAPONS: WeaponType[] = [
  'SWORD_SHIELD', 'GREATSWORD', 'SPEAR', 'DAGGER', 'BOW',
  'CROSSBOW', 'STAFF', 'SCYTHE', 'HAMMER', 'FLAIL', 'TWIN_SWORDS',
  'BARE_HANDS', 'SPECIAL',
]
const VALID_PLAYSTYLES: BuildPlaystyle[] = [
  'MAIN_STORY', 'BOSS_HUNTER', 'COMPLETIONIST', 'EXPLORER',
]

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

// POST /api/builds — 빌드 생성
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { title, character, weaponPrimary, weaponSecondary, playstyle, descriptionKo, descriptionEn } = body

  // 필수 필드 검증
  if (typeof title !== 'string' || title.trim().length < 2 || title.trim().length > 100) {
    return NextResponse.json({ error: '제목은 2-100자여야 합니다.' }, { status: 400 })
  }
  if (!VALID_CHARACTERS.includes(character)) {
    return NextResponse.json({ error: '유효하지 않은 캐릭터입니다.' }, { status: 400 })
  }
  if (!VALID_WEAPONS.includes(weaponPrimary)) {
    return NextResponse.json({ error: '유효하지 않은 주무기입니다.' }, { status: 400 })
  }
  if (weaponSecondary !== undefined && weaponSecondary !== null && !VALID_WEAPONS.includes(weaponSecondary)) {
    return NextResponse.json({ error: '유효하지 않은 보조무기입니다.' }, { status: 400 })
  }
  if (!VALID_PLAYSTYLES.includes(playstyle)) {
    return NextResponse.json({ error: '유효하지 않은 플레이스타일입니다.' }, { status: 400 })
  }

  const descKo = typeof descriptionKo === 'string' ? descriptionKo.slice(0, 2000) : null
  const descEn = typeof descriptionEn === 'string' ? descriptionEn.slice(0, 2000) : null

  // slug 생성 (충돌 시 suffix 추가)
  const baseSlug = slugify(title.trim())
  const suffix = Date.now().toString(36)
  const slug = `${baseSlug}-${suffix}`

  try {
    const build = await prisma.build.create({
      data: {
        slug,
        title: title.trim(),
        character,
        weaponPrimary,
        weaponSecondary: weaponSecondary ?? null,
        playstyle,
        descriptionKo: descKo,
        descriptionEn: descEn,
        authorId: user?.id ?? null,
      },
    })
    return NextResponse.json({ id: build.id, slug: build.slug }, { status: 201 })
  } catch (err) {
    console.error('[build create]', err)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
