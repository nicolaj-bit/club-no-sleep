import React from 'react';

// Club No Sleep-logoet (C'et) brugt som indlaesningsmaerke.
//
// Formen er tegnet ud fra app-ikonet og ligger som en SVG-sti, ikke som et
// billede. Det giver tre ting: den er skarp i alle stoerrelser, den tager
// farve efter temaet (moerkebrun i lyst tema, lysere i moerkt), og den er der
// med det samme. Et billede skulle hentes over nettet foerst, og det er jo
// netop den ventetid, maerket skal daekke over.
//
// Den drejer ikke rundt. Et logo, der roterer, ser forkert ud. I stedet
// aander den roligt. Har brugeren slaaet bevaegelse fra i telefonens
// indstillinger, staar den stille.

const PATH = 'M301 0C314.8 -0.2 336.5 -0.3 354 1C371.5 2.3 391 5 406 8C421 11 431.2 14.2 444 19C456.8 23.8 475.8 33.2 483 37C490.2 40.8 486 39.5 487 42C488 44.5 487 34 489 52C491 70 497.5 132.3 499 150C500.5 167.7 499.2 156.5 498 158C496.8 159.5 493.3 159.2 492 159C490.7 158.8 492.8 164.3 490 157C487.2 149.7 479.3 125.5 475 115C470.7 104.5 468.5 101.3 464 94C459.5 86.7 454.3 78.5 448 71C441.7 63.5 433 55 426 49C419 43 412 38.7 406 35C400 31.3 395.8 29.5 390 27C384.2 24.5 378.8 22.2 371 20C363.2 17.8 355.3 15.3 343 14C330.7 12.7 309.8 11.8 297 12C284.2 12.2 276.5 13.3 266 15C255.5 16.7 242.3 19.8 234 22C225.7 24.2 224.8 24.2 216 28C207.2 31.8 192.2 38.3 181 45C169.8 51.7 158.8 59.5 149 68C139.2 76.5 128.5 88.7 122 96C115.5 103.3 114.2 105.7 110 112C105.8 118.3 102.2 123 97 134C91.8 145 83.5 164.3 79 178C74.5 191.7 72.2 203.3 70 216C67.8 228.7 66.5 238.8 66 254C65.5 269.2 66.2 293.7 67 307C67.8 320.3 69.2 324.8 71 334C72.8 343.2 75.2 352.7 78 362C80.8 371.3 84.3 381.2 88 390C91.7 398.8 93.5 404 100 415C106.5 426 116.5 443 127 456C137.5 469 150.5 482.3 163 493C175.5 503.7 191 513.3 202 520C213 526.7 220.5 529.5 229 533C237.5 536.5 244.2 538.7 253 541C261.8 543.3 273.2 545.7 282 547C290.8 548.3 296.5 548.8 306 549C315.5 549.2 330.2 548.7 339 548C347.8 547.3 352.8 546.2 359 545C365.2 543.8 368.8 543.3 376 541C383.2 538.7 395 534.2 402 531C409 527.8 412.7 525.5 418 522C423.3 518.5 428.3 515 434 510C439.7 505 446.2 498.8 452 492C457.8 485.2 463.2 478.5 469 469C474.8 459.5 482.5 444.8 487 435C491.5 425.2 494 414.7 496 410C498 405.3 497.5 407.3 499 407C500.5 406.7 503.8 406.5 505 408C506.2 409.5 507.3 398.7 506 416C504.7 433.3 498.8 495.2 497 512C495.2 528.8 496.2 515.3 495 517C493.8 518.7 495.5 519 490 522C484.5 525 472.8 530.7 462 535C451.2 539.3 435.8 544.7 425 548C414.2 551.3 406 553.2 397 555C388 556.8 381.8 557.8 371 559C360.2 560.2 344.5 561.5 332 562C319.5 562.5 311.2 563 296 562C280.8 561 259 559.3 241 556C223 552.7 204 547.5 188 542C172 536.5 159.2 530.7 145 523C130.8 515.3 116 506.2 103 496C90 485.8 77.2 473.2 67 462C56.8 450.8 49.3 440.5 42 429C34.7 417.5 28.3 405.2 23 393C17.7 380.8 13.5 369.3 10 356C6.5 342.7 3.7 325.7 2 313C0.3 300.3 0.2 290.3 0 280C-0.2 269.7 0.2 260.8 1 251C1.8 241.2 3.5 229.5 5 221C6.5 212.5 7.5 208.3 10 200C12.5 191.7 16.5 179.7 20 171C23.5 162.3 27 155.3 31 148C35 140.7 38.2 135.2 44 127C49.8 118.8 59.2 106.8 66 99C72.8 91.2 77.7 86.5 85 80C92.3 73.5 101.7 66 110 60C118.3 54 124.7 49.7 135 44C145.3 38.3 161.2 30.7 172 26C182.8 21.3 190.2 19 200 16C209.8 13 219.2 10.3 231 8C242.8 5.7 259.3 3.3 271 2C282.7 0.7 287.2 0.2 301 0Z';

const VB_W = 507;
const VB_H = 563;

/** Selve logoet. Kan ogsaa bruges uden for indlaesningsskaermen. */
export function BrandMark({ size = 64, color = 'var(--color-primary)', className = '', style = {} }) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={Math.round((size * VB_W) / VB_H)}
      height={size}
      className={className}
      style={style}
      role="img"
      aria-label="Club No Sleep"
    >
      <path d={PATH} fill={color} />
    </svg>
  );
}

/** Indlaesningsmaerket, midt paa et tomt skaermbillede. */
export default function BrandLoader({ size = 64, fullScreen = true, background }) {
  const mark = (
    <>
      <style>{`
        @keyframes cns-breathe {
          0%, 100% { opacity: 0.55; transform: scale(0.96); }
          50%      { opacity: 1;    transform: scale(1); }
        }
        .cns-breathe { animation: cns-breathe 1.6s ease-in-out infinite; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .cns-breathe { animation: none; opacity: 0.85; }
        }
      `}</style>
      <BrandMark size={size} className="cns-breathe" />
    </>
  );

  if (!fullScreen) return mark;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: background || 'var(--color-bg)' }}
    >
      {mark}
    </div>
  );
}
