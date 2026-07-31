export type DemoRoute = {
  id: string;
  color: string;
  label: string;
  path: string;
};

export const ROUTES: DemoRoute[] = [
  {
    id: "run",
    color: "#f2684a",
    label: "跑步",
    path: "M130 194 C220 85 350 106 402 198 C451 285 375 373 262 346 C170 324 93 273 130 194Z",
  },
  {
    id: "ride",
    color: "#78a7ff",
    label: "骑行",
    path: "M72 420 C210 350 310 432 421 376 C516 329 595 216 716 254 C826 288 876 393 1016 338",
  },
  {
    id: "hike",
    color: "#173f34",
    label: "登山",
    path: "M682 128 C607 183 646 255 590 299 C542 338 557 411 637 438 C705 460 773 411 798 345 C827 270 789 210 842 155",
  },
  {
    id: "walk",
    color: "#f4cb42",
    label: "徒步",
    path: "M456 488 C398 431 312 472 282 532 C249 598 296 657 371 653 C458 649 492 577 554 596 C624 618 661 692 758 650",
  },
];

export const FILTERS = ["全部", "跑步", "骑行", "徒步", "登山"];

export const STATS = [
  { label: "距离", value: "9.84", unit: "KM" },
  { label: "时长", value: "51:36", unit: "" },
  { label: "配速", value: "5'14\"", unit: "/KM" },
  { label: "爬升", value: "74", unit: "M" },
];
