/**
 * 일어일문학과 2025131457 김범준
 * 라면 전문 특화 맵 애플리케이션 (Ramen Special Map Web Application)
 * 
 * 주요 기능:
 * 1. Leaflet.js & OpenStreetMap 연동
 * 2. 위치 정보 수집 및 현재 위치 기반 주변 가상 가게 자동 생성
 * 3. 취향에 맞는 스프 계통 및 현재 영업 여부 기반 복합 필터링
 * 4. 지도와 상세 정보 패널 간 실시간 연동
 */

// 1. 라면집 초기 데이터베이스 (서울 주요 대학가 홍대/신촌의 실제 유명 라면집 10곳)
const INITIAL_RAMEN_SHOPS = [
  {
    id: "oreno-ramen",
    name: "오레노라멘 본점",
    soup: "토리파이탄",
    noodle: "얇은 면 (호소멘)",
    address: "서울 마포구 독막로6길 14",
    tel: "0507-1309-3539",
    coords: [37.5492, 126.9142],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:00", close: "21:00", breakStart: null, breakEnd: null }, // 일
      { day: 1, open: "11:00", close: "21:00", breakStart: null, breakEnd: null }, // 월
      { day: 2, open: "11:00", close: "21:00", breakStart: null, breakEnd: null }, // 화
      { day: 3, open: "11:00", close: "21:00", breakStart: null, breakEnd: null }, // 수
      { day: 4, open: "11:00", close: "21:00", breakStart: null, breakEnd: null }, // 목
      { day: 5, open: "11:00", close: "21:00", breakStart: null, breakEnd: null }, // 금
      { day: 6, open: "11:00", close: "21:00", breakStart: null, breakEnd: null }  // 토
    ],
    description: "닭을 주재료로 진하고 부드럽게 우려낸 거품 가득한 뽀얀 육수(토리파이탄)가 일품인 대한민국 최초 미쉐린 가이드 빕구르망 선정 라멘집입니다."
  },
  {
    id: "menya-jun",
    name: "멘야준",
    soup: "시오",
    noodle: "중간 면 (스트레이트멘)",
    address: "서울 마포구 동교로 128",
    tel: "070-7612-4213",
    coords: [37.5543, 126.9118],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:00", close: "20:00", breakStart: null, breakEnd: null },
      { day: 1, open: "11:00", close: "20:00", breakStart: null, breakEnd: null },
      { day: 2, open: "11:00", close: "20:00", breakStart: null, breakEnd: null },
      { day: 3, open: "11:00", close: "20:00", breakStart: null, breakEnd: null },
      { day: 4, open: "11:00", close: "20:00", breakStart: null, breakEnd: null },
      { day: 5, open: "11:00", close: "20:00", breakStart: null, breakEnd: null },
      { day: 6, open: "11:00", close: "20:00", breakStart: null, breakEnd: null }
    ],
    description: "깔끔하고 정갈한 닭 육수 베이스에 소금(시오)으로 깊은 맛을 낸 시오라멘 전문점으로, 특유의 담백하고 깊은 맑은 국물이 매력적입니다."
  },
  {
    id: "damtaek",
    name: "담택",
    soup: "시오",
    noodle: "얇은 면 (호소멘)",
    address: "서울 마포구 독막로3길 28-10",
    tel: "02-6014-1908",
    coords: [37.5504, 126.9147],
    isVirtual: false,
    hours: [
      { day: 0, open: null, close: null }, // 일요일 휴무
      { day: 1, open: "11:30", close: "20:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 2, open: "11:30", close: "20:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 3, open: "11:30", close: "20:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 4, open: "11:30", close: "20:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 5, open: "11:30", close: "20:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 6, open: "11:30", close: "20:00", breakStart: "15:00", breakEnd: "17:00" }
    ],
    description: "합정의 명물 시오라멘 맛집. 유자시오라멘, 레몬시오라멘 등 상큼하고 독창적인 변주를 주는 메뉴로 여성 고객들에게도 인기가 많습니다."
  },
  {
    id: "mutahiro",
    name: "무타히로",
    soup: "쇼유",
    noodle: "굵은 면 (치지레멘)",
    address: "서울 마포구 백범로1길 8-1",
    tel: "070-7798-6788",
    coords: [37.5562, 126.9312],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 1, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 2, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 3, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 4, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 5, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 6, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" }
    ],
    description: "도쿄 국분사(고쿠분지) 유명 맛집의 신촌 분점. 멸치와 간장(쇼유)으로 진하게 낸 육수에 쫄깃한 식감의 굵은 면을 조합한 개성 넘치는 라멘을 맛볼 수 있습니다."
  },
  {
    id: "ramen-truck",
    name: "라멘트럭 본점",
    soup: "돈코츠",
    noodle: "얇은 면 (호소멘)",
    address: "서울 마포구 독막로14길 31",
    tel: "02-336-6812",
    coords: [37.5478, 126.9224],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:00", close: "21:30", breakStart: null, breakEnd: null },
      { day: 1, open: "11:00", close: "21:30", breakStart: null, breakEnd: null },
      { day: 2, open: "11:00", close: "21:30", breakStart: null, breakEnd: null },
      { day: 3, open: "11:00", close: "21:30", breakStart: null, breakEnd: null },
      { day: 4, open: "11:00", close: "21:30", breakStart: null, breakEnd: null },
      { day: 5, open: "11:00", close: "21:30", breakStart: null, breakEnd: null },
      { day: 6, open: "11:00", close: "21:30", breakStart: null, breakEnd: null }
    ],
    description: "트럭 시절부터 시작해 상수를 지켜온 라멘 강자. 돈코츠 육수와 닭 육수를 최적의 비율로 블렌딩하여 초심자도 부담 없이 먹을 수 있는 부드러운 돈코츠 라멘입니다."
  },
  {
    id: "hakatabunko",
    name: "하카타분코",
    soup: "돈코츠",
    noodle: "얇은 면 (호소멘)",
    address: "서울 마포구 독막로19길 43",
    tel: "02-338-5536",
    coords: [37.5479, 126.9238],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:30", close: "03:00", breakStart: null, breakEnd: null }, // 새벽 3시 영업 종료
      { day: 1, open: "11:30", close: "03:00", breakStart: null, breakEnd: null },
      { day: 2, open: "11:30", close: "03:00", breakStart: null, breakEnd: null },
      { day: 3, open: "11:30", close: "03:00", breakStart: null, breakEnd: null },
      { day: 4, open: "11:30", close: "03:00", breakStart: null, breakEnd: null },
      { day: 5, open: "11:30", close: "03:00", breakStart: null, breakEnd: null },
      { day: 6, open: "11:30", close: "03:00", breakStart: null, breakEnd: null }
    ],
    description: "한국 돈코츠 라멘의 원조 격인 터줏대감 매장. 묵직하고 끈적할 정도로 진한 돈코츠 육수(인라멘)를 고수하며, 늦은 밤 해장을 위해 찾는 손님들로 붐빕니다."
  },
  {
    id: "butanchu-shinchon",
    name: "부탄츄 신촌점",
    soup: "돈코츠",
    noodle: "면 굵기 선택 가능 (얇은/중간/굵은)",
    address: "서울 서대문구 연세로5길 26-9",
    tel: "02-3144-6604",
    coords: [37.5574, 126.9351],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:30", close: "21:30", breakStart: null, breakEnd: null },
      { day: 1, open: "11:30", close: "21:30", breakStart: null, breakEnd: null },
      { day: 2, open: "11:30", close: "21:30", breakStart: null, breakEnd: null },
      { day: 3, open: "11:30", close: "21:30", breakStart: null, breakEnd: null },
      { day: 4, open: "11:30", close: "21:30", breakStart: null, breakEnd: null },
      { day: 5, open: "11:30", close: "21:30", breakStart: null, breakEnd: null },
      { day: 6, open: "11:30", close: "21:30", breakStart: null, breakEnd: null }
    ],
    description: "엄청나게 묵직하고 진한 돈골 육수를 베이스로 하는 정통 교토 풍 라멘집. 마늘, 소스, 숙주나물의 양뿐만 아니라 면의 굵기(호소멘, 치지레멘, 드래곤멘)까지 취향껏 직접 커스텀할 수 있습니다."
  },
  {
    id: "56ramen",
    name: "56라멘",
    soup: "이에케",
    noodle: "굵은 면 (이에케 전용멘)",
    address: "서울 마포구 와우산로29바길 10",
    tel: "02-336-0560",
    coords: [37.5579, 126.9288],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:30", close: "21:00", breakStart: null, breakEnd: null },
      { day: 1, open: "11:30", close: "21:00", breakStart: null, breakEnd: null },
      { day: 2, open: "11:30", close: "21:00", breakStart: null, breakEnd: null },
      { day: 3, open: "11:30", close: "21:00", breakStart: null, breakEnd: null },
      { day: 4, open: "11:30", close: "21:00", breakStart: null, breakEnd: null },
      { day: 5, open: "11:30", close: "21:00", breakStart: null, breakEnd: null },
      { day: 6, open: "11:30", close: "21:00", breakStart: null, breakEnd: null }
    ],
    description: "돈골 육수와 쇼유 타레를 혼합하고 닭기름(치유)을 얹은 요코하마식 '이에케 라멘'을 국내에 알린 신흥 명소입니다. 김과 시금치 토핑이 특징입니다."
  },
  {
    id: "mashitaya",
    name: "마시타야",
    soup: "쇼유",
    noodle: "굵은 면 (치지레멘)",
    address: "서울 마포구 와우산로29길 4-30",
    tel: "02-3144-7772",
    coords: [37.5568, 126.9272],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:30", close: "20:30", breakStart: null, breakEnd: null },
      { day: 1, open: "11:30", close: "20:30", breakStart: null, breakEnd: null },
      { day: 2, open: null, close: null }, // 화요일 정기휴무
      { day: 3, open: "11:30", close: "20:30", breakStart: null, breakEnd: null },
      { day: 4, open: "11:30", close: "20:30", breakStart: null, breakEnd: null },
      { day: 5, open: "11:30", close: "20:30", breakStart: null, breakEnd: null },
      { day: 6, open: "11:30", close: "20:30", breakStart: null, breakEnd: null }
    ],
    description: "완성도 높은 소유라멘(블랙라멘)과 마제소바로 정평이 나 있습니다. 정갈하고 강렬한 간장의 아로마와 풍미 가득한 기름맛이 특징입니다."
  },
  {
    id: "jirou-ramen",
    name: "지로우라멘",
    soup: "돈코츠",
    noodle: "얇은 면 (호소멘)",
    address: "서울 마포구 와우산로29바길 9",
    tel: "02-332-3969",
    coords: [37.5532, 126.9241],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:00", close: "21:30", breakStart: null, breakEnd: null },
      { day: 1, open: "11:00", close: "21:30", breakStart: null, breakEnd: null },
      { day: 2, open: "11:00", close: "21:30", breakStart: null, breakEnd: null },
      { day: 3, open: "11:00", close: "21:30", breakStart: null, breakEnd: null },
      { day: 4, open: "11:00", close: "21:30", breakStart: null, breakEnd: null },
      { day: 5, open: "11:00", close: "21:30", breakStart: null, breakEnd: null },
      { day: 6, open: "11:00", close: "21:30", breakStart: null, breakEnd: null }
    ],
    description: "홍대 놀이터 골목의 숨은 강자. 입문자를 위한 라이트한 농도부터 매니아를 위한 초극진 돈골 육수까지 육수 선택이 가능하여 인기가 높습니다."
  },
  {
    id: "hakuten-ramen",
    name: "하쿠텐",
    soup: "이에케",
    noodle: "굵은 면 (치지레멘)",
    address: "서울 마포구 동교로 266-12 반지하",
    tel: "02-3144-3758",
    coords: [37.5606, 126.9249],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 1, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 2, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 3, open: null, close: null }, // 수요일 휴무
      { day: 4, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 5, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" },
      { day: 6, open: "11:30", close: "21:00", breakStart: "15:00", breakEnd: "17:00" }
    ],
    description: "연남동을 평정한 인기 최고의 요코하마식 이에케 라멘 전문점. 훈연 차슈와 진한 시금치 토핑, 짭조름하고 묵직한 돈골 간장 육수로 두터운 매니아층을 보유하고 있습니다."
  },
  {
    id: "kyo-ramen",
    name: "쿄라멘",
    soup: "돈코츠",
    noodle: "얇은 면 (호소멘)",
    address: "서울 마포구 동교로46길 25 지층",
    tel: "02-6338-8043",
    coords: [37.5614, 126.9238],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:30", close: "19:30", breakStart: "14:50", breakEnd: "17:00" },
      { day: 1, open: null, close: null }, // 월요일 휴무
      { day: 2, open: "11:30", close: "19:30", breakStart: "14:50", breakEnd: "17:00" },
      { day: 3, open: "11:30", close: "19:30", breakStart: "14:50", breakEnd: "17:00" },
      { day: 4, open: "11:30", close: "19:30", breakStart: "14:50", breakEnd: "17:00" },
      { day: 5, open: "11:30", close: "19:30", breakStart: "14:50", breakEnd: "17:00" },
      { day: 6, open: "11:30", close: "19:30", breakStart: "14:50", breakEnd: "17:00" }
    ],
    description: "연남동 골목의 한국형 돈코츠 라멘 전문점. 걸쭉하고 크리미하며 고소한 초고농도 뼈 국물과 얇은 세면의 환상적인 하모니를 경험할 수 있습니다."
  },
  {
    id: "566-ramen",
    name: "566라멘",
    soup: "쇼유",
    noodle: "굵은 면 (초극태면)",
    address: "서울 마포구 연남로3길 33",
    tel: "070-4064-6958",
    coords: [37.5620, 126.9238],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:30", close: "20:30", breakStart: null, breakEnd: null },
      { day: 1, open: "11:30", close: "20:30", breakStart: null, breakEnd: null },
      { day: 2, open: "11:30", close: "20:30", breakStart: null, breakEnd: null },
      { day: 3, open: "11:30", close: "20:30", breakStart: null, breakEnd: null },
      { day: 4, open: null, close: null }, // 목요일 휴무
      { day: 5, open: "11:30", close: "20:30", breakStart: null, breakEnd: null },
      { day: 6, open: "11:30", close: "20:30", breakStart: null, breakEnd: null }
    ],
    description: "국내 지로계 라멘의 독보적 최고봉. 씹는 맛이 강한 극도로 두꺼운 초극태면, 산더미 같은 채소와 차슈, 풍성한 세아부라와 마늘이 이루는 자극적인 맛의 극한을 선사합니다."
  },
  {
    id: "daebu-ramen",
    name: "대부라멘",
    soup: "돈코츠",
    noodle: "얇은 면 (자가제면 호소멘)",
    address: "서울 성북구 고려대로26길 14 102호",
    tel: "0507-1358-1325",
    coords: [37.5860, 127.0298],
    isVirtual: false,
    hours: [
      { day: 0, open: null, close: null }, // 일요일 휴무
      { day: 1, open: "11:30", close: "21:00", breakStart: "14:30", breakEnd: "17:00" },
      { day: 2, open: "11:30", close: "21:00", breakStart: "14:30", breakEnd: "17:00" },
      { day: 3, open: "11:30", close: "21:00", breakStart: "14:30", breakEnd: "17:00" },
      { day: 4, open: "11:30", close: "21:00", breakStart: "14:30", breakEnd: "17:00" },
      { day: 5, open: "11:30", close: "21:00", breakStart: "14:30", breakEnd: "17:00" },
      { day: 6, open: "11:30", close: "20:00", breakStart: null, breakEnd: null } // 토요일은 브레이크 없음
    ],
    description: "고려대 안암역 먹자골목의 숨겨진 자가제면 강자. 사장님이 직접 반죽하여 뽑는 얇은 면발과 오랫동안 진하게 우려내 고소하고 개운한 돈코츠 육수가 학생들에게 극찬을 받습니다."
  },
  {
    id: "kuidoraku-anam",
    name: "쿠이도라쿠",
    soup: "돈코츠",
    noodle: "얇은 면 (호소멘)",
    address: "서울 성북구 안암로 103 (안암동5가)",
    tel: "02-928-0734",
    coords: [37.5854, 127.0287],
    isVirtual: false,
    hours: [
      { day: 0, open: "11:30", close: "21:30", breakStart: null, breakEnd: null },
      { day: 1, open: "11:30", close: "21:30", breakStart: null, breakEnd: null },
      { day: 2, open: "11:30", close: "21:30", breakStart: null, breakEnd: null },
      { day: 3, open: "11:30", close: "21:30", breakStart: null, breakEnd: null },
      { day: 4, open: "11:30", close: "21:30", breakStart: null, breakEnd: null },
      { day: 5, open: "11:30", close: "21:30", breakStart: null, breakEnd: null },
      { day: 6, open: "11:30", close: "21:30", breakStart: null, breakEnd: null }
    ],
    description: "고려대 역사와 함께한 돈코츠 라멘의 조상님격 노포 매장. 진득하고 구수한 규슈식 돈코츠 육수에 공기밥과 음료가 무한 리필되어 지갑이 가벼운 고대생들의 가성비 천국입니다."
  }
];

// 2. 전역 상태 관리
let ramenShops = [...INITIAL_RAMEN_SHOPS];
let map = null;
let markers = {};
let activeShopId = null;
let userMarker = null;
let userCoords = null;
let isVirtualGenerated = false;

// 필터 상태
const filterState = {
  searchQuery: "",
  selectedSoups: new Set(["all"]), // 'all' 또는 특정 스프명들
  showOnlyOpen: false
};

// 요일 한글 맵
const DAY_KOREAN = ["일", "월", "화", "수", "목", "금", "토"];

// 3. 애플리케이션 초기화
function init() {
  try {
    if (typeof L === 'undefined') {
      showLoadError("지도 라이브러리(Leaflet)를 로드하지 못했습니다. 인터넷 연결 상태를 확인하거나 CDN이 정상인지 확인해 주세요.");
      return;
    }
    
    const mapElement = document.getElementById("map");
    if (!mapElement) {
      showLoadError("지도 영역(#map)을 찾을 수 없습니다.");
      return;
    }
    
    initMap();
    initEventListeners();
    renderShopList();
    
    // Geolocation 자동 권한 요청 및 사용자 위치 탐색
    requestUserLocation();
  } catch (error) {
    console.error("초기화 중 오류 발생:", error);
    showLoadError("애플리케이션 초기화 중 오류가 발생했습니다: " + error.message);
  }
}

function showLoadError(message) {
  const container = document.getElementById("shop-list-container");
  if (container) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fa-solid fa-circle-exclamation" style="color: #ef4444; font-size: 32px; margin-bottom: 12px;"></i>
        <p>${message}</p>
        <button onclick="window.location.reload()" style="margin-top: 10px;">다시 시도</button>
      </div>
    `;
  }
}

// readyState가 이미 interactive 또는 complete라면 즉시 실행, 아니면 DOMContentLoaded 대기
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}


// 4. 지도 초기화 (CARTO Dark Matter 프리미엄 다크 테마 적용)
function initMap() {
  // 기본 중심점: 신촌/홍대 중심부
  const defaultCenter = [37.5545, 126.9240];
  const defaultZoom = 14;

  map = L.map("map", {
    zoomControl: false, // 커스텀 줌 버튼 위치 조정을 위해 비활성화
    attributionControl: true
  }).setView(defaultCenter, defaultZoom);

  // 다크 테마 타일 레이어 추가 (CARTO Dark Matter)
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20
  }).addTo(map);

  // 줌 버튼을 우측 상단에 수동으로 배치
  L.control.zoom({
    position: "topright"
  }).addTo(map);

  // 초기 마커 렌더링
  updateMarkers();
}

// 5. 마커 갱신 및 렌더링
function updateMarkers() {
  // 기존 마커 전체 제거
  Object.values(markers).forEach(marker => map.removeLayer(marker));
  markers = {};

  const filteredShops = getFilteredShops();

  filteredShops.forEach(shop => {
    const isOpen = checkIfOpen(shop);
    const statusText = isOpen ? "영업 중" : "영업 종료";
    
    // 커스텀 마커 아이콘 정의 (스프별 아이콘 연동 가능)
    const markerHtml = `
      <div class="marker-pin">
        <i class="fa-solid fa-bowl-food marker-icon"></i>
      </div>
    `;

    const customIcon = L.divIcon({
      className: `custom-marker ${activeShopId === shop.id ? 'active' : ''}`,
      html: markerHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // 지도 위에 마커 설치
    const marker = L.marker(shop.coords, { icon: customIcon }).addTo(map);
    markers[shop.id] = marker;

    // 마커 클릭 시 핸들러
    marker.on("click", (e) => {
      // 팝업 열기 전에 약간 지연시켜 지도 패닝과 연동
      selectShop(shop.id, true);
    });

    // 마커 팝업 바인딩
    const popupContent = `
      <div class="map-popup-card">
        <h4>${shop.name} ${shop.isVirtual ? '⚡' : ''}</h4>
        <p>${shop.address}</p>
        <div class="popup-footer">
          <span class="tag tag-soup">${shop.soup}</span>
          <span class="status-badge ${isOpen ? 'open' : 'closed'}">${statusText}</span>
          <a class="popup-detail-link" onclick="selectShop('${shop.id}', false)">상세보기 &rarr;</a>
        </div>
      </div>
    `;
    marker.bindPopup(popupContent);
  });
}

// 6. 현재 시간 기준 영업 상태 분석 (매우 정교한 판정 엔진)
function checkIfOpen(shop, time = new Date()) {
  const currentDay = time.getDay(); // 0(일) ~ 6(토)
  const currentHour = time.getHours();
  const currentMin = time.getMinutes();
  const currentMins = currentHour * 60 + currentMin;

  const yesterdayDay = (currentDay + 6) % 7;

  const todaySchedule = shop.hours.find(h => h.day === currentDay);
  const yesterdaySchedule = shop.hours.find(h => h.day === yesterdayDay);

  let isOpen = false;

  // 1. 오늘의 영업 시간 매칭
  if (todaySchedule && todaySchedule.open) {
    const [oH, oM] = todaySchedule.open.split(":").map(Number);
    const [cH, cM] = todaySchedule.close.split(":").map(Number);
    const oMins = oH * 60 + oM;
    let cMins = cH * 60 + cM;

    if (cMins < oMins) {
      // 자정 넘어서까지 영업하는 경우 (예: 11:30 ~ 익일 03:00)
      if (currentMins >= oMins || currentMins < cMins) {
        isOpen = true;
      }
    } else {
      // 일반 영업 시간 (예: 11:00 ~ 21:00)
      if (currentMins >= oMins && currentMins < cMins) {
        isOpen = true;
      }
    }

    // 브레이크타임 제외 판정
    if (isOpen && todaySchedule.breakStart && todaySchedule.breakEnd) {
      const [bsH, bsM] = todaySchedule.breakStart.split(":").map(Number);
      const [beH, beM] = todaySchedule.breakEnd.split(":").map(Number);
      const bsMins = bsH * 60 + bsM;
      const beMins = beH * 60 + beM;

      if (currentMins >= bsMins && currentMins < beMins) {
        isOpen = false; // 브레이크 타임은 영업 중이 아님
      }
    }
  }

  // 2. 어제 시작되어 오늘 새벽까지 이어지는 영업 시간 매칭 (현재 시간이 새벽인 경우 작동)
  if (!isOpen && yesterdaySchedule && yesterdaySchedule.open) {
    const [oH, oM] = yesterdaySchedule.open.split(":").map(Number);
    const [cH, cM] = yesterdaySchedule.close.split(":").map(Number);
    const oMins = oH * 60 + oM;
    const cMins = cH * 60 + cM;

    if (cMins < oMins) {
      // 어제 영업 종료 시각이 자정 이후인 경우, 오늘 새벽에 속하는지 체크
      if (currentMins < cMins) {
        isOpen = true;
      }
    }
  }

  return isOpen;
}

// 7. 검색 결과 및 필터 로직
function getFilteredShops() {
  return ramenShops.filter(shop => {
    // 7.1 스프 필터
    let soupMatch = false;
    if (filterState.selectedSoups.has("all")) {
      soupMatch = true;
    } else {
      // 현재 가게의 스프 계통 분류 추출 (ex. "돈코츠", "시오" 등)
      // 가게 데이터의 soup이 필터링 셋에 들어있는지 대조
      if (filterState.selectedSoups.has(shop.soup)) {
        soupMatch = true;
      }
    }

    // 7.2 영업중 필터
    const openMatch = !filterState.showOnlyOpen || checkIfOpen(shop);

    // 7.3 이름/주소 텍스트 검색 필터
    const query = filterState.searchQuery.trim().toLowerCase();
    const searchMatch = !query || 
      shop.name.toLowerCase().includes(query) || 
      shop.address.toLowerCase().includes(query) ||
      shop.soup.toLowerCase().includes(query);

    return soupMatch && openMatch && searchMatch;
  });
}

// 8. 사이드바 라면집 리스트 렌더링
function renderShopList() {
  const container = document.getElementById("shop-list-container");
  const countSpan = document.getElementById("results-count");
  
  const filteredShops = getFilteredShops();
  countSpan.textContent = filteredShops.length;

  if (filteredShops.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fa-solid fa-map-location-dot"></i>
        <p>조건에 일치하는 라면집이 없습니다.</p>
        <button id="reset-all-filters-btn">필터 및 검색 초기화</button>
      </div>
    `;
    
    document.getElementById("reset-all-filters-btn").addEventListener("click", resetAllFilters);
    return;
  }

  container.innerHTML = "";
  filteredShops.forEach(shop => {
    const isOpen = checkIfOpen(shop);
    const card = document.createElement("div");
    card.className = `shop-card ${activeShopId === shop.id ? 'active' : ''}`;
    card.dataset.id = shop.id;

    // 가상 매장 태그
    const virtualTag = shop.isVirtual ? `<span class="tag tag-virtual"><i class="fa-solid fa-bolt"></i> 주변가상</span>` : "";

    card.innerHTML = `
      <div class="shop-card-header">
        <h3 class="shop-name">${shop.name}</h3>
        <span class="status-badge ${isOpen ? 'open' : 'closed'}">
          ${isOpen ? '영업 중' : '영업 종료'}
        </span>
      </div>
      <div class="shop-tags">
        <span class="tag tag-soup">${shop.soup}</span>
        <span class="tag tag-noodle">${shop.noodle.split(" ")[0]}</span>
        ${virtualTag}
      </div>
      <div class="shop-info-row">
        <i class="fa-solid fa-location-dot"></i>
        <span>${shop.address}</span>
      </div>
      <div class="shop-info-row">
        <i class="fa-solid fa-clock"></i>
        <span>${getTodayHoursText(shop)}</span>
      </div>
    `;

    // 카드 클릭 이벤트
    card.addEventListener("click", () => {
      selectShop(shop.id, true);
    });

    container.appendChild(card);
  });
}

// 오늘 영업 시간 텍스트 출력 도우미
function getTodayHoursText(shop) {
  const today = new Date().getDay();
  const schedule = shop.hours.find(h => h.day === today);
  if (!schedule || !schedule.open) return "오늘 휴무";
  let text = `${schedule.open} ~ ${schedule.close}`;
  if (schedule.breakStart && schedule.breakEnd) {
    text += ` (브레이크: ${schedule.breakStart}~${schedule.breakEnd})`;
  }
  return text;
}

// 9. 특정 가게 선택 처리 (사이드바 리스트 & 지도 인터랙션 통합)
function selectShop(shopId, shouldPan = true) {
  activeShopId = shopId;
  const shop = ramenShops.find(s => s.id === shopId);
  if (!shop) return;

  // 9.1 리스트 카드 액티브 디자인 적용
  document.querySelectorAll(".shop-card").forEach(card => {
    if (card.dataset.id === shopId) {
      card.classList.add("active");
      // 스크롤 포커싱
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      card.classList.remove("active");
    }
  });

  // 9.2 지도 갱신 (마커 크기 및 색상 변경 반영)
  updateMarkers();

  // 9.3 지도 중심 이동 및 팝업 열기
  if (markers[shopId]) {
    const marker = markers[shopId];
    if (shouldPan) {
      map.panTo(shop.coords, { animate: true, duration: 0.5 });
    }
    setTimeout(() => {
      marker.openPopup();
    }, 100);
  }

  // 9.4 우측/하단 상세 정보 노출
  showDetailPanel(shop);

  // 모바일인 경우 지도가 보이고 리스트가 오버레이되었으므로
  // 상세조회를 누르면 목록 시트를 잠시 접어 상세를 편히 보게 함 (필요 시)
}

// 10. 상세 정보 패널 활성화
function showDetailPanel(shop) {
  const panel = document.getElementById("detail-panel");
  const content = document.getElementById("detail-content");

  // 영업 시간표 빌드
  let hoursRowsHtml = "";
  const currentDay = new Date().getDay();
  
  // 요일 순서대로 정렬하여 렌더링 (월요일부터 시작하도록 정렬)
  const orderedDays = [1, 2, 3, 4, 5, 6, 0];
  orderedDays.forEach(dayIndex => {
    const h = shop.hours.find(item => item.day === dayIndex);
    const dayName = DAY_KOREAN[dayIndex];
    let timeText = "정기 휴무";
    if (h && h.open) {
      timeText = `${h.open} - ${h.close}`;
      if (h.breakStart) {
        timeText += ` (휴게시간: ${h.breakStart} - ${h.breakEnd})`;
      }
    }
    hoursRowsHtml += `
      <tr class="${dayIndex === currentDay ? 'current-day' : ''}">
        <td style="width: 70px;">${dayName}요일</td>
        <td style="text-align: right;">${timeText}</td>
      </tr>
    `;
  });

  const isOpen = checkIfOpen(shop);

  content.innerHTML = `
    <div class="detail-header">
      <div class="detail-title-group">
        <h2 class="detail-name">${shop.name}</h2>
        <span class="status-badge ${isOpen ? 'open' : 'closed'}">
          ${isOpen ? '영업 중' : '영업 종료'}
        </span>
      </div>
      <div class="shop-tags" style="margin-top: 8px;">
        <span class="tag tag-soup"><i class="fa-solid fa-spoon"></i> ${shop.soup} 계통</span>
        <span class="tag tag-noodle"><i class="fa-solid fa-wheat-awn"></i> ${shop.noodle}</span>
        ${shop.isVirtual ? '<span class="tag tag-virtual"><i class="fa-solid fa-bolt"></i> 실시간 가상 매장</span>' : ''}
      </div>
    </div>

    <div class="detail-section">
      <h3 class="detail-section-title"><i class="fa-solid fa-circle-info"></i> 매장 소개</h3>
      <p style="font-size: 13.5px; line-height: 1.6; color: var(--text-main);">${shop.description}</p>
    </div>

    <div class="detail-section">
      <h3 class="detail-section-title"><i class="fa-solid fa-list-check"></i> 라멘 취향 정보</h3>
      <div class="spec-grid">
        <div class="spec-item">
          <span class="spec-label">스프 타입</span>
          <span class="spec-value">${shop.soup}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">기본 면 굵기</span>
          <span class="spec-value">${shop.noodle.split(" ")[0]}</span>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h3 class="detail-section-title"><i class="fa-solid fa-map-location"></i> 위치 및 연락처</h3>
      <div class="detail-info-list">
        <div class="detail-info-item">
          <i class="fa-solid fa-location-dot"></i>
          <div class="detail-info-item-content">
            <div style="font-weight: 600; color: #fff;">도로명 주소</div>
            <div style="color: var(--text-muted); font-size:12.5px;">${shop.address}</div>
          </div>
        </div>
        <div class="detail-info-item">
          <i class="fa-solid fa-phone"></i>
          <div class="detail-info-item-content">
            <div style="font-weight: 600; color: #fff;">전화번호</div>
            <div style="color: var(--text-muted); font-size:12.5px;">${shop.tel}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h3 class="detail-section-title"><i class="fa-solid fa-clock"></i> 영업시간 상세</h3>
      <table class="hours-table">
        <tbody>
          ${hoursRowsHtml}
        </tbody>
      </table>
    </div>
  `;

  panel.classList.add("open");
}

// 11. 이벤트 리스너 통합 설정
function initEventListeners() {
  // 11.1 검색 인풋
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");

  searchInput.addEventListener("input", (e) => {
    filterState.searchQuery = e.target.value;
    clearSearchBtn.style.display = e.target.value ? "block" : "none";
    applyFilters();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    filterState.searchQuery = "";
    clearSearchBtn.style.display = "none";
    applyFilters();
  });

  // 11.2 스프 필터 칩 클릭 핸들러
  const soupChips = document.querySelectorAll("#soup-filters .chip");
  soupChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const soupType = chip.dataset.soup;

      if (soupType === "all") {
        filterState.selectedSoups.clear();
        filterState.selectedSoups.add("all");
        soupChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
      } else {
        // '전체'가 선택되어 있었다면 제거
        if (filterState.selectedSoups.has("all")) {
          filterState.selectedSoups.delete("all");
          document.querySelector('[data-soup="all"]').classList.remove("active");
        }

        // 토글 활성화/비활성화
        if (filterState.selectedSoups.has(soupType)) {
          filterState.selectedSoups.delete(soupType);
          chip.classList.remove("active");
        } else {
          filterState.selectedSoups.add(soupType);
          chip.classList.add("active");
        }

        // 아무것도 선택하지 않았다면 다시 '전체' 활성화
        if (filterState.selectedSoups.size === 0) {
          filterState.selectedSoups.add("all");
          document.querySelector('[data-soup="all"]').classList.add("active");
        }
      }

      applyFilters();
    });
  });

  // 11.3 영업중 토글 스위치
  const openNowToggle = document.getElementById("open-now-toggle");
  openNowToggle.addEventListener("change", (e) => {
    filterState.showOnlyOpen = e.target.checked;
    applyFilters();
  });

  // 11.4 상세정보 닫기 버튼
  const closeDetailBtn = document.getElementById("close-detail");
  const detailPanel = document.getElementById("detail-panel");
  closeDetailBtn.addEventListener("click", () => {
    detailPanel.classList.remove("open");
    activeShopId = null;
    updateMarkers();
    
    // 리스트 카드 액티브 상태 해제
    document.querySelectorAll(".shop-card").forEach(card => card.classList.remove("active"));
  });

  // 11.5 내 위치 핀포인트 이동 버튼
  const geoBtn = document.getElementById("geo-locate-btn");
  geoBtn.addEventListener("click", () => {
    requestUserLocation(true);
  });

  // 11.6 모바일 바 토글 버튼
  const mobileToggleBtn = document.getElementById("mobile-toggle");
  const sidebar = document.getElementById("sidebar");
  mobileToggleBtn.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("active");
    if (isOpen) {
      mobileToggleBtn.innerHTML = `<i class="fa-solid fa-map"></i> 지도 보기`;
      mobileToggleBtn.classList.add("sidebar-open");
    } else {
      mobileToggleBtn.innerHTML = `<i class="fa-solid fa-list-ul"></i> 목록 및 필터`;
      mobileToggleBtn.classList.remove("sidebar-open");
    }
  });
}

// 필터 상태 변경 시 일괄 적용 로직
function applyFilters() {
  updateMarkers();
  renderShopList();
}

// 모든 필터 상태 완벽 초기화
function resetAllFilters() {
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");
  const openNowToggle = document.getElementById("open-now-toggle");
  const soupChips = document.querySelectorAll("#soup-filters .chip");

  searchInput.value = "";
  clearSearchBtn.style.display = "none";
  openNowToggle.checked = false;

  filterState.searchQuery = "";
  filterState.selectedSoups.clear();
  filterState.selectedSoups.add("all");
  filterState.showOnlyOpen = false;

  soupChips.forEach(c => {
    if (c.dataset.soup === "all") c.classList.add("active");
    else c.classList.remove("active");
  });

  applyFilters();
}

// 12. 위치 권한 및 Geolocation 구동
function requestUserLocation(forcePan = false) {
  if (!navigator.geolocation) {
    console.warn("이 브라우저에서는 Geolocation을 지원하지 않습니다.");
    return;
  }

  // Geolocation API 획득 시도
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      userCoords = [lat, lng];

      // 사용자 위치 마커 생성/이동
      if (userMarker) {
        userMarker.setLatLng(userCoords);
      } else {
        const userIcon = L.divIcon({
          className: "user-marker",
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        userMarker = L.marker(userCoords, { icon: userIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup("<b>내 현재 위치</b>");
      }

      // 첫 획득이거나 강제 이동 요청일 시 지도 중앙 패닝
      if (!isVirtualGenerated || forcePan) {
        map.setView(userCoords, 15);
      }

      // 가상 가게 자동 생성 (사용자 위치 근처 반경 500m 이내에 5개 생성)
      if (!isVirtualGenerated) {
        generateVirtualShops(lat, lng);
        isVirtualGenerated = true;
      }
    },
    (error) => {
      console.warn(`위치 정보를 가져오는 데 실패했습니다 (코드: ${error.code}): ${error.message}`);
      // 기본 홍대입구로 설정하고 초기 상태로 유지
      if (forcePan) {
        alert("위치 서비스 권한이 거부되었거나 신호를 찾을 수 없습니다. 브라우저 위치 권한을 확인해주세요.");
      }
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );
}

// 13. 주변 500m 가상 가게 생성기 (위치 기반 필터링 동작 시각적 입증용)
function generateVirtualShops(centerLat, centerLng) {
  // 생성할 가상 가게의 시그니처 템플릿 정의
  const virtualTemplates = [
    {
      name: "범준라멘 (내 주변 직영점)",
      soup: "토리파이탄",
      noodle: "얇은 면 (호소멘)",
      description: "일어일문학과 2025131457 김범준 학생의 이름을 딴 가상의 시그니처 라멘 매장입니다. 진한 토리파이탄 베이스에 향긋한 트러플 오일이 가미되었습니다.",
      tel: "02-1234-5678"
    },
    {
      name: "하카타 야타이 (주변 2호점)",
      soup: "돈코츠",
      noodle: "얇은 면 (호소멘)",
      description: "하카타 포장마차(야타이) 감성을 그대로 옮겨 담은 가상의 돈코츠 전문점입니다. 마늘 기름인 마유를 듬뿍 뿌려 풍미가 뛰어납니다.",
      tel: "02-9876-5432"
    },
    {
      name: "이에케 쇼크 (주변점)",
      soup: "이에케",
      noodle: "굵은 면 (치지레멘)",
      description: "돼지뼈 육수와 간장의 최강 조합, 요코하마 이에케 전문 가상 매장입니다. 밥을 무제한으로 제공하여 든든하게 식사를 마칠 수 있습니다.",
      tel: "02-2468-1357"
    },
    {
      name: "삿포로 미소공방 (주변점)",
      soup: "미소",
      noodle: "굵은 면 (치지레멘)",
      description: "구수한 미소(일본식 된장)를 불맛나게 볶아 야채와 함께 끓여낸 삿포로식 가상 미소라멘 전문점입니다. 옥수수와 버터 토핑을 추천합니다.",
      tel: "02-1357-2468"
    },
    {
      name: "소유노모리 (주변점)",
      soup: "쇼유",
      noodle: "중간 면 (스트레이트멘)",
      description: "맑은 닭 육수와 깊고 맑은 간장 베이스를 정교하게 블렌딩한 가상의 쇼유라멘 전문점입니다. 반숙 계란이 입안에서 녹아내립니다.",
      tel: "02-1111-2222"
    }
  ];

  // 반경 500m 이내에 마커 분포시키기 (위도 경도 변위 계산: 0.001도당 대략 110m)
  virtualTemplates.forEach((tpl, idx) => {
    // 임의의 라디안 각도와 거리 생성 (최대 500m)
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 400; // 100m ~ 500m
    
    const latOffset = (distance * Math.sin(angle)) / 111000;
    const lngOffset = (distance * Math.cos(angle)) / (111000 * Math.cos(centerLat * Math.PI / 180));

    const coords = [centerLat + latOffset, centerLng + lngOffset];
    const id = `virtual-shop-${idx + 1}`;

    // 임의의 영업일정 세팅 (다양한 요일 및 브레이크 타임 설정으로 필터 검증 강화)
    const hours = [];
    for (let day = 0; day <= 6; day++) {
      // 일부 요일은 정기 휴무로 세팅해 영업중 필터 오차 검증 가능하게 함
      if (day === (idx + 1) % 7) {
        hours.push({ day, open: null, close: null });
      } else {
        // 브레이크 타임 무작위 삽입
        const hasBreak = day % 2 === 0;
        hours.push({
          day,
          open: "11:00",
          close: "21:30",
          breakStart: hasBreak ? "15:00" : null,
          breakEnd: hasBreak ? "17:00" : null
        });
      }
    }

    const virtualShop = {
      id,
      name: tpl.name,
      soup: tpl.soup,
      noodle: tpl.noodle,
      address: `서울시 가상구 주변동 (현재 내 위치 반경 ${Math.round(distance)}m 거리)`,
      tel: tpl.tel,
      coords,
      isVirtual: true,
      hours,
      description: tpl.description
    };

    ramenShops.push(virtualShop);
  });

  // 가상 샵들이 로드되었으므로 지도 및 리스트를 즉각 갱신
  applyFilters();
}

// 14. 전역 함수 바인딩 (HTML inline onclick 대응)
window.selectShop = selectShop;

