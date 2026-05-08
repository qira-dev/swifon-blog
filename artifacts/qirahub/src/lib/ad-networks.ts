export interface CredentialField {
  key: string;
  label: string;
  placeholder: string;
  hint: string;
  type?: "text" | "password";
  required?: boolean;
}

export interface NetworkDef {
  value: string;
  label: string;
  color: string;
  hint?: string;
  credentialFields: CredentialField[];
  slotLabel?: string;
  slotHint?: string;
  canAutoGenerate?: boolean;
}

export const AD_NETWORKS: NetworkDef[] = [
  {
    value: "custom",
    label: "Custom / Direct",
    color: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    hint: "Direct banner, affiliate, or self-hosted ad",
    credentialFields: [],
  },
  {
    value: "google_adsense",
    label: "Google AdSense",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    hint: "Paste your AdSense code or enter Publisher ID + Slot ID for auto-configuration",
    credentialFields: [
      {
        key: "publisherId",
        label: "Publisher ID",
        placeholder: "ca-pub-1234567890123456",
        hint: "Found in AdSense → Account → Account info",
        required: true,
      },
    ],
    slotLabel: "Ad Slot ID (data-ad-slot)",
    slotHint: "The numeric slot ID for this specific ad unit, found in AdSense → Ads → By ad unit",
    canAutoGenerate: true,
  },
  {
    value: "media_net",
    label: "Media.net",
    color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    hint: "Yahoo / Bing contextual ads",
    credentialFields: [
      {
        key: "cid",
        label: "Customer ID (CID)",
        placeholder: "12345678",
        hint: "Your Media.net CID / Site ID from the dashboard",
        required: true,
      },
    ],
    slotLabel: "Ad Slot / Unit ID",
    slotHint: "The specific ad unit ID for this placement",
    canAutoGenerate: true,
  },
  {
    value: "propeller_ads",
    label: "PropellerAds",
    color: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    hint: "Propeller Ads push / interstitial / banner",
    credentialFields: [
      {
        key: "zoneId",
        label: "Zone ID",
        placeholder: "123456",
        hint: "From PropellerAds → Sites & Zones",
        required: true,
      },
    ],
    slotLabel: "Zone ID (for this unit)",
    slotHint: "Specific zone ID for this ad placement (if different from global)",
    canAutoGenerate: true,
  },
  {
    value: "adsterra",
    label: "Adsterra",
    color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    hint: "Adsterra smart banner or social bar code",
    credentialFields: [
      {
        key: "publisherKey",
        label: "Banner / Publisher Key",
        placeholder: "abcdef1234567890abcdef1234567890",
        hint: "The unique key from your Adsterra banner code (found in the script src URL)",
        required: true,
        type: "password",
      },
    ],
    canAutoGenerate: false,
  },
  {
    value: "ezoic",
    label: "Ezoic",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    hint: "Ezoic placeholder div or script",
    credentialFields: [
      {
        key: "publisherId",
        label: "Site / Publisher ID",
        placeholder: "123456",
        hint: "Your Ezoic site ID from the Ezoic dashboard",
        required: true,
      },
    ],
    slotLabel: "Placeholder ID",
    slotHint: "The Ezoic placeholder number for this ad unit",
    canAutoGenerate: true,
  },
  {
    value: "mgid",
    label: "MGID",
    color: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    hint: "MGID native / widget script",
    credentialFields: [
      {
        key: "clientName",
        label: "Client / Site Name",
        placeholder: "yoursite.com",
        hint: "Your MGID client identifier (usually your domain)",
        required: true,
      },
      {
        key: "widgetId",
        label: "Widget ID",
        placeholder: "123456",
        hint: "MGID widget ID for this placement",
      },
    ],
    slotLabel: "Widget ID (per placement)",
    slotHint: "Specific MGID widget ID for this ad slot",
    canAutoGenerate: false,
  },
  {
    value: "taboola",
    label: "Taboola",
    color: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    hint: "Taboola feed widget code",
    credentialFields: [
      {
        key: "publisherId",
        label: "Publisher Account ID",
        placeholder: "your-publisher-id",
        hint: "From Taboola Backstage → Settings",
        required: true,
      },
    ],
    slotLabel: "Placement ID / Mode",
    slotHint: "Taboola placement identifier for this widget",
    canAutoGenerate: true,
  },
  {
    value: "outbrain",
    label: "Outbrain",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    hint: "Outbrain Smartfeed widget",
    credentialFields: [
      {
        key: "widgetId",
        label: "Widget ID",
        placeholder: "AR_12345678",
        hint: "From Outbrain dashboard → Widget settings",
        required: true,
      },
    ],
    canAutoGenerate: true,
  },
  {
    value: "amazon_publisher",
    label: "Amazon Publisher Services",
    color: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
    hint: "Amazon UAM / APT tag",
    credentialFields: [
      {
        key: "publisherUuid",
        label: "Publisher UUID",
        placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        hint: "From Amazon Publisher Services → Account settings",
        required: true,
      },
    ],
    slotLabel: "Slot UUID",
    slotHint: "The specific slot/position UUID for this ad unit",
    canAutoGenerate: true,
  },
  {
    value: "adstar",
    label: "AdStar",
    color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    hint: "AdStar network tag code",
    credentialFields: [
      {
        key: "zoneId",
        label: "Zone ID",
        placeholder: "12345",
        hint: "Your AdStar zone ID",
        required: true,
      },
      {
        key: "tagId",
        label: "Tag ID",
        placeholder: "67890",
        hint: "Your AdStar tag ID (if applicable)",
      },
    ],
    canAutoGenerate: false,
  },
  {
    value: "infolinks",
    label: "Infolinks",
    color: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    hint: "Infolinks in-text or in-frame script",
    credentialFields: [
      {
        key: "pid",
        label: "Publisher ID (pid)",
        placeholder: "1234567",
        hint: "From Infolinks → Account → Publisher ID",
        required: true,
      },
      {
        key: "wsid",
        label: "Site ID (wsid)",
        placeholder: "7654321",
        hint: "From Infolinks → Sites → Site ID",
        required: true,
      },
    ],
    canAutoGenerate: true,
  },
  {
    value: "revcontent",
    label: "RevContent",
    color: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
    hint: "RevContent native widget",
    credentialFields: [
      {
        key: "widgetId",
        label: "Widget ID",
        placeholder: "12345",
        hint: "From RevContent → Widgets",
        required: true,
      },
    ],
    canAutoGenerate: true,
  },
  {
    value: "other",
    label: "Other Network",
    color: "bg-muted text-muted-foreground border-border",
    hint: "Any other ad network code",
    credentialFields: [
      {
        key: "apiKey",
        label: "API Key / Publisher ID",
        placeholder: "Your API key or publisher ID",
        hint: "The main identifier/key for your ad network",
        type: "password",
      },
      {
        key: "clientId",
        label: "Client ID (optional)",
        placeholder: "Client or account ID",
        hint: "Secondary identifier if required by the network",
      },
      {
        key: "secret",
        label: "Secret / Token (optional)",
        placeholder: "Secret key or access token",
        hint: "API secret or access token if required",
        type: "password",
      },
    ],
    canAutoGenerate: false,
  },
];

export function getNetworkDef(network: string): NetworkDef {
  return AD_NETWORKS.find((n) => n.value === network) ?? AD_NETWORKS[0];
}

export function generateAdCode(
  network: string,
  credentials: Record<string, string>,
  slotId?: string | null
): string {
  switch (network) {
    case "google_adsense": {
      const pub = credentials.publisherId || "";
      const slot = slotId || "";
      return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pub}" crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${pub}"
     data-ad-slot="${slot}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`;
    }
    case "media_net": {
      const cid = credentials.cid || "";
      const slot = slotId || cid;
      return `<script async src="//contextual.media.net/dmedianet.js?cid=${cid}&cid2=${slot}"></script>
<div id="medianetvideo${slot}"></div>`;
    }
    case "propeller_ads": {
      const zoneId = slotId || credentials.zoneId || "";
      return `<script>(function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('zwiezdal.com',${zoneId},document.createElement('script'))</script>`;
    }
    case "ezoic": {
      const pid = credentials.publisherId || "";
      const placeholder = slotId || "101";
      return `<div id="ezoic-pub-ad-placeholder-${placeholder}"> </div>
<!-- Ezoic - ${placeholder} - under_page_title -->
<script>
  window.ezoSTPixelScripts = window.ezoSTPixelScripts || [];
  window.ezoSTPixelScripts.push({mode:'async'});
  ezstandalone.define(${placeholder});
</script>`;
    }
    case "taboola": {
      const publisherId = credentials.publisherId || "";
      const placement = slotId || "below-article";
      const containerId = `taboola-${placement.toLowerCase().replace(/\s+/g, "-")}`;
      return `<div id="${containerId}"></div>
<script type="text/javascript">
window._taboola = window._taboola || [];
_taboola.push({ mode: 'thumbnails-a', container: '${containerId}', placement: '${placement}', target_type: 'mix' });
</script>
<script type="text/javascript" async src="//cdn.taboola.com/libtrc/${publisherId}/loader.js" id="tb_loader_script"></script>`;
    }
    case "outbrain": {
      const widgetId = credentials.widgetId || "";
      return `<div class="OUTBRAIN" data-src="https://example.com" data-widget-id="${widgetId}" data-ob-template=""></div>
<script type="text/javascript" async src="//widgets.outbrain.com/outbrain.js"></script>`;
    }
    case "amazon_publisher": {
      const uuid = credentials.publisherUuid || "";
      const slot = slotId || "";
      return `<div id="amzn-assoc-ad-${slot}"></div>
<script async src="//z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US&adInstanceId=${slot}"></script>`;
    }
    case "infolinks": {
      const pid = credentials.pid || "";
      const wsid = credentials.wsid || "";
      return `<script>
  var infolinks_pid = ${pid};
  var infolinks_wsid = ${wsid};
</script>
<script type="text/javascript" src="//resources.infolinks.com/js/infolinks_main.js"></script>`;
    }
    case "revcontent": {
      const widgetId = credentials.widgetId || slotId || "";
      return `<div id="rc_widget_${widgetId}"></div>
<script src="https://assets.revcontent.com/master/delivery.js" defer></script>`;
    }
    default:
      return "";
  }
}
