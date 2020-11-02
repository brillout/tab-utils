import "./ad_layout.css";
import "./ad_layout_left.css";
import "./ad_layout_btf.css";
import "./ad-dev-debug.css";
import { tab_app_google_adsense } from "../../tab_app_info";
import React from "react";
import assert from "@brillout/assert";
import {
  AdSlots,
  getAdsenseSlotId,
  getEzoicSlot,
  getGptSlot,
  GptSlot,
  SlotName,
} from "./adSlots";

// export { Ad_ATF, Ad_BTF };
export { Ad_btf_2 };
export { Ad_left };

function Ad_left({ ad_slots }) {
  const slot_left_atf = get_left_slot("LEFT_AD_ATF", ad_slots);
  const slot_left_btf = get_left_slot("LEFT_AD_BTF", ad_slots);
  assert(slot_left_atf || slot_left_btf);

  return (
    <div id="ads-left">
      {slot_left_atf}
      {slot_left_btf}
    </div>
  );
}

function get_left_slot(slot_name: SlotName, ad_slots: AdSlots) {
  let content: React.ReactElement;
  let is_floating: boolean;
  {
    const adsense_id = getAdsenseSlotId(slot_name, ad_slots);
    if (adsense_id) {
      content = <AdSenseAd slot_id={adsense_id} slotName={slot_name} />;
    }
  }
  {
    const gptSlot = getGptSlot(slot_name, ad_slots);
    if (gptSlot) {
      content = <GptAd gptSlot={gptSlot} slotName={slot_name} />;
    }
  }

  {
    const ezoic_slot = getEzoicSlot(slot_name, ad_slots);
    if (ezoic_slot) {
      const ezoic_id = ezoic_slot.slot_id;
      content = <EzoicAd ezoic_id={ezoic_id} slotName={slot_name} />;

      is_floating = ezoic_slot.is_floating;
      assert([true, undefined].includes(is_floating));
    }
  }

  if (!content) {
    return null;
  }

  return (
    <div className="slot-left">
      <div
        className={
          "vertical-slot-wrapper" + (is_floating ? " is_floating" : "")
        }
      >
        {content}
      </div>
    </div>
  );
}

function Ad_btf_2({ ad_slots }) {
  const slot_name = "BTF_2";

  let slot_content: React.ReactElement;
  {
    const adsense_id = getAdsenseSlotId(slot_name, ad_slots);
    if (adsense_id) {
      slot_content = (
        <AdSenseAd
          slotName={slot_name}
          slot_id={adsense_id}
          auto_sizing={"horizontal"}
        />
      );
      // Do no include the container when doing auto_sizing
      return slot_content;
    }
  }
  {
    const gptSlot = getGptSlot(slot_name, ad_slots);
    if (gptSlot) {
      slot_content = <GptAd gptSlot={gptSlot} slotName={slot_name} />;
    }
  }

  {
    const ezoic_slot = getEzoicSlot(slot_name, ad_slots);
    if (ezoic_slot) {
      assert(slot_content === undefined);
      const ezoic_id = ezoic_slot.slot_id;
      slot_content = <EzoicAd ezoic_id={ezoic_id} slotName={slot_name} />;
    }
  }

  if (!slot_content) {
    return null;
  }

  return <div className="slot_btf_container">{slot_content}</div>;
}

/*
function Ad_ATF({ ad_slots }) {
  return <AdView ad_slots={ad_slots} slot_name={"ATF"} />;
}
function Ad_BTF({ ad_slots }) {
  return <AdView ad_slots={ad_slots} slot_name={"BTF"} />;
}

function AdView({ ad_slots, slot_name }: {ad_slots: AdSlots, slot_name: SlotName}) {
  assert(["ATF", "BTF"].includes(slot_name));
  const slot_id = getAdsenseSlotId(slot_name, ad_slots);
  if (slot_id === null) return null;
  return (
    <div className="advi-wrap">
      <div className="horizontal-slot-wrapper">
        <AdSenseAd slot_id={slot_id} slotName={slot_name} />
      </div>
    </div>
  );
}
 */

function EzoicAd({
  ezoic_id,
  slotName,
}: {
  ezoic_id: string;
  slotName: SlotName;
}) {
  assert(ezoic_id);
  assert(ezoic_id.startsWith("ezoic-pub-ad-placeholder-1"));
  return (
    <div className={"ezoic-ad-slot slot-" + slotName}>
      <div id={ezoic_id} />
      <div className="ezoic-dev-demo" />
    </div>
  );
}

function GptAd({
  gptSlot,
  slotName,
}: {
  gptSlot: GptSlot;
  slotName: SlotName;
}): React.ReactElement {
  return (
    <div
      id={gptSlot.slot_id}
      className={"slot-" + slotName}
      style={{ width: gptSlot.slotSize[0], height: gptSlot.slotSize[1] }}
    />
  );
}

function AdSenseAd({
  slot_id,
  slotName,
  auto_sizing = undefined,
}: {
  slot_id: string;
  slotName: SlotName;
  auto_sizing?: "horizontal";
}) {
  assert(tab_app_google_adsense.startsWith("ca-pub-"));
  assert([undefined, "horizontal"].includes(auto_sizing));

  const props = {};
  if (auto_sizing) {
    Object.assign(props, {
      "data-ad-format": auto_sizing,
      "data-full-width-responsive": true,
    });
  }

  return (
    <ins
      className={"adsbygoogle slot-" + slotName}
      data-ad-client={tab_app_google_adsense}
      data-ad-slot={slot_id}
      {...props}
    ></ins>
  );
}
