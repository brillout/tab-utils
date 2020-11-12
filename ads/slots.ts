import assert from "@brillout/assert";

export {
  getGptSlot,
  getEzoicSlot,
  getAdsenseSlotId,
  isAdsense,
  isEzoic,
  isGpt,
  getGptSlots,
  getAdsenseSlots,
};

export type AdSlots = EzoicSlot[] | AdsenseSlot[] | GptSlot[];
export type AdSlot = EzoicSlot | AdsenseSlot | GptSlot;
export type SlotName = "LEFT_AD_ATF" | "LEFT_AD_BTF" | "BTF_2";
type AdSpec = {
  slot_id: string;
  slot_name: SlotName;
};
export type EzoicSlot = AdSpec & {
  is_ezoic: true;
  is_floating?: true;
};
export type AdsenseSlot = AdSpec & {
  is_adsense: true;
};
export type GptSizeMap = {
  viewport: [number, number];
  adSize: [number, number] | [];
};
export type GptSlot = AdSpec & {
  slotSize: [number, number];
  adName: string;
  is_gpt: true;
  sizeMapping?: GptSizeMap[];
};

function getEzoicSlot(slot_name: string, ad_slots: AdSlots): EzoicSlot {
  const ezoic_slots = getEzoicSlots(ad_slots).filter((slot) => {
    assert(slot_name);
    assert(slot.slot_name);
    return slot.slot_name === slot_name;
  });
  assert(ezoic_slots.length <= 1);
  const slot = ezoic_slots[0];
  if (!slot) return null;
  const { slot_id } = slot;
  assert(slot_id);
  return slot;
}

function getGptSlot(slotName: string, adSlots: AdSlots): GptSlot | null {
  const slots: GptSlot[] = getGptSlots(adSlots).filter((slot) => {
    assert(slotName);
    assert(slot.slot_name);
    return slot.slot_name === slotName;
  });
  assert(slots.length <= 1);
  const slot = slots[0];
  if (!slot) return null;
  return slot;
}

function getAdsenseSlotId(slotName: string, ad_slots: AdSlots) {
  const adsense_slots = getAdsenseSlots(ad_slots).filter((slot) => {
    assert(slotName);
    assert(slot.slot_name);
    return slot.slot_name === slotName;
  });
  assert(adsense_slots.length <= 1);
  const slot = adsense_slots[0];
  if (!slot) return null;
  const { slot_id } = slot;
  assert(slot_id);
  return slot_id;
}

function getEzoicSlots(AD_SLOTS: AdSlot[]): EzoicSlot[] {
  return AD_SLOTS.filter(isEzoicSlot);
}
function getAdsenseSlots(AD_SLOTS: AdSlot[]): AdsenseSlot[] {
  return AD_SLOTS.filter(isAdsenseSlot);
}
function getGptSlots(AD_SLOTS: AdSlot[]): GptSlot[] {
  return AD_SLOTS.filter(isGptSlot);
}
function isGpt(adSlots: AdSlots) {
  const len = getGptSlots(adSlots).length;
  assert(len === 0 || len === adSlots.length);
  return len > 0;
}
function isEzoic(adSlots: AdSlots) {
  const len = getEzoicSlots(adSlots).length;
  assert(len === 0 || len === adSlots.length);
  return len > 0;
}
function isAdsense(adSlots: AdSlots) {
  const len = getAdsenseSlots(adSlots).length;
  assert(len === 0 || len === adSlots.length);
  return len > 0;
}
function isEzoicSlot(adSlot: AdSlot): adSlot is EzoicSlot {
  return "is_ezoic" in adSlot;
}
function isAdsenseSlot(adSlot: AdSlot): adSlot is AdsenseSlot {
  return "is_adsense" in adSlot;
}
function isGptSlot(adSlot: AdSlot): adSlot is GptSlot {
  return "is_gpt" in adSlot;
}
