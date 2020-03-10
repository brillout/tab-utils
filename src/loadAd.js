import loadScript from './loadScript';
import removeAd from './removeAd';

export default loadAd;

function loadAd(AD_SLOTS) {
  console.log('load-progress - start loading ad');

  if( removeAd() ){
    console.log('load-progress - ad removed');
    return;
  }

  loadAdsByGoogle();
  loadGoogleTag(AD_SLOTS);
  loadApsTag(AD_SLOTS);

  AD_SLOTS.forEach(({slotID}) => {
    googletag.cmd.push(function() { googletag.display(slotID); });
  });

  setInterval(function () {
    refreshBids(AD_SLOTS, {timeout: 2e3});
  }, 90000);
}
function loadAdsByGoogle() {
  const scriptEl = loadScript('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
  scriptEl.setAttribute('data-ad-client', "ca-pub-3994464140431603");
}


function loadGoogleTag(AD_SLOTS) {
  loadScript("https://securepubads.g.doubleclick.net/tag/js/gpt.js");

  window.googletag = window.googletag || {cmd: []};
  googletag.cmd.push(function() {
    AD_SLOTS.forEach(({slotID, slotName, slotSize}) => {
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

function refreshBids(AD_SLOTS, args) {
  apstag.fetchBids(
    {
      slots: AD_SLOTS.map(({slotID, slotName, slotSize}) => {
        return {
          slotID,
          slotName,
          sizes: [slotSize],
        };
      }),
      ...args
    },
    function(bids) {
      // set apstag bids, then trigger the first request to DFP

      // set apstag targeting on googletag then refresh all DFP

      googletag.cmd.push(function() {
          apstag.setDisplayBids();
          googletag.pubads().refresh();
          console.log("load-progress", "ad refreshed");
      });
    }
  );
}

function loadApsTag(AD_SLOTS) {
  !function(a9,a,p,s,t,A,g){if(a[a9])return;function q(c,r){a[a9]._Q.push([c,r])}a[a9]={init:function(){q("i",arguments)},fetchBids:function(){q("f",arguments)},setDisplayBids:function(){},targetingKeys:function(){return[]},_Q:[]};A=p.createElement(s);A.async=!0;A.src=t;g=p.getElementsByTagName(s)[0];g.parentNode.insertBefore(A,g)}("apstag",window,document,"script","//c.amazon-adsystem.com/aax2/apstag.js");

  apstag.init({
     pubID:  '9f69069e-7132-4170-a8f2-2b572c005f5b',
     adServer: 'googletag',
     bidTimeout: 2e3
  });

  refreshBids(AD_SLOTS);
}


