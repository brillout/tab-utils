import {loadScript} from '../loadScript';
import assert from "@brillout/assert";

export {loadGpt};

function loadGpt() {
  const gptSlots = (
    AD_SLOTS.filter(({is_gpt}) => is_gpt)
  );

  if( gptSlots.length===0 )return;

  loadScript("https://securepubads.g.doubleclick.net/tag/js/gpt.js");

  window.googletag = window.googletag || {cmd: []};
  googletag.cmd.push(function() {
    gptSlots
      .forEach(({slotID, slotName, slotSize}) => {
        assert(slotID);
        assert(slotName);
        assert(slotSize);
      googletag
      .defineSlot(slotName, slotSize, slotID)
      .addService(googletag.pubads());
    });

    googletag.pubads().disableInitialLoad();
    //googletag.pubads().enableSingleRequest();
    googletag.enableServices();

    console.log("load-progress", "ad enabled - 1");
  });
}

  window.googletag = window.googletag || {cmd: []};
  googletag.cmd.push(function() {
    googletag.defineSlot('/21951210418/CCT//clocktab//leftvertical', [160, 600], 'div-gpt-ad-1598363422743-0').addService(googletag.pubads());
    googletag.defineSlot('/21951210418/CCT//clocktab//leftverticalbtf', [160, 600], 'div-gpt-ad-1598363455018-0').addService(googletag.pubads());
    googletag.defineSlot('/21951210418/CCT//clocktab//horizontalbtf', [728, 90], 'div-gpt-ad-1598363482235-0').addService(googletag.pubads());
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
  });

//Body section:
<!-- /21951210418/CCT//clocktab//leftvertical -->
<div id='div-gpt-ad-1598363422743-0' style='width: 160px; height: 600px;'>
  <script>
    googletag.cmd.push(function() { googletag.display('div-gpt-ad-1598363422743-0'); });
  </script>
</div>

<!-- /21951210418/CCT//clocktab//leftverticalbtf -->
<div id='div-gpt-ad-1598363455018-0' style='width: 160px; height: 600px;'>
  <script>
    googletag.cmd.push(function() { googletag.display('div-gpt-ad-1598363455018-0'); });
  </script>
</div>

<!-- /21951210418/CCT//clocktab//horizontalbtf -->
<div id='div-gpt-ad-1598363482235-0' style='width: 728px; height: 90px;'>
  <script>
    googletag.cmd.push(function() { googletag.display('div-gpt-ad-1598363482235-0'); });
  </script>
</div>
