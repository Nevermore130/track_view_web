export type DemoRoute = {
  id: string;
  color: string;
  distanceKm: number;
  end: [number, number];
  label: string;
  name: string;
  path: string;
  start: [number, number];
};

export const ROUTES: DemoRoute[] = [
  {
    id: "run",
    color: "#f2684a",
    distanceKm: 9.84,
    end: [213, 278],
    label: "跑步",
    name: "西湖晨跑",
    path:
      "M176 252 L164 238 L158 220 L160 199 L169 178 L183 158 L203 143 L225 132 L251 126 L278 127 L304 134 L327 146 L346 163 L359 184 L366 207 L367 231 L361 255 L349 277 L332 297 L311 314 L286 327 L260 336 L235 337 L213 331 L194 320 L179 305 L168 287 L164 271 L169 258 L176 252 L186 255 L196 265 L213 278",
    start: [176, 252],
  },
  {
    id: "ride",
    color: "#78a7ff",
    distanceKm: 42.6,
    end: [1018, 369],
    label: "骑行",
    name: "钱塘江绿道骑行",
    path:
      "M54 492 L82 491 L111 487 L139 480 L169 470 L198 456 L225 441 L250 426 L278 416 L307 414 L338 410 L368 399 L393 384 L416 365 L438 344 L461 325 L487 311 L515 303 L545 301 L575 300 L605 293 L634 282 L661 267 L686 250 L710 237 L735 232 L759 234 L781 244 L800 259 L815 278 L829 298 L846 316 L867 332 L891 342 L918 348 L945 351 L972 354 L996 360 L1018 369",
    start: [54, 492],
  },
  {
    id: "hike",
    color: "#173f34",
    distanceKm: 13.7,
    end: [846, 136],
    label: "登山",
    name: "北高峰环线",
    path:
      "M706 474 L685 463 L661 447 L640 428 L626 407 L623 387 L631 369 L648 354 L667 341 L678 325 L680 309 L672 292 L670 275 L678 257 L693 242 L713 233 L734 228 L752 216 L761 200 L765 181 L774 161 L790 143 L809 133 L829 132 L846 136 L854 149 L850 164 L839 178 L826 189 L815 203 L813 220 L821 237 L833 252 L838 268 L832 282 L816 291 L796 295 L779 305 L770 321 L773 339 L785 356 L790 375 L786 396 L776 416 L760 434 L741 450 L722 463 L706 474",
    start: [706, 474],
  },
  {
    id: "walk",
    color: "#f4cb42",
    distanceKm: 17.46,
    end: [881, 641],
    label: "徒步",
    name: "九溪烟树徒步",
    path:
      "M266 594 L279 578 L293 563 L308 548 L326 535 L344 523 L363 516 L382 510 L401 511 L420 514 L438 507 L452 496 L463 482 L473 468 L487 456 L503 449 L521 447 L540 452 L555 462 L570 471 L589 474 L608 474 L627 468 L643 457 L660 451 L678 449 L695 453 L708 463 L718 478 L728 495 L740 512 L754 529 L770 543 L789 550 L808 562 L823 577 L836 595 L847 614 L861 631 L881 641",
    start: [266, 594],
  },
];

export const FILTERS = ["全部", "跑步", "骑行", "徒步", "登山"];

export const TOTAL_DISTANCE_KM = ROUTES.reduce(
  (total, route) => total + route.distanceKm,
  0,
);

export const STATS = [
  { label: "距离", value: "9.84", unit: "KM" },
  { label: "时长", value: "51:36", unit: "" },
  { label: "配速", value: "5'14\"", unit: "/KM" },
  { label: "爬升", value: "74", unit: "M" },
];
