(function(){"use strict";const r=window.Vue;function m(){return window.panel}function N(){return m().api}const $=()=>window.panel.plugins.viewButtons!==void 0;function oe(){return $()?new Proxy({},{get(){throw new Error("Vuex store is not available. Are you using Kirby 5? Use the `useContent` composable instead.")}}):m().app.$store}function re(){const t=m(),n=oe(),o=$(),e=g(o?()=>t.view.props.content:()=>n.getters["content/values"]()),a=g(o?()=>t.content.changes():()=>n.getters["content/changes"]()),i=g(o?()=>Object.keys(a.value).length>0:()=>n.getters["content/hasChanges"]()),s=o?t.content:new Proxy({},{get(){return()=>{}}});return{content:s,currentContent:e,contentChanges:a,hasChanges:i,update:async(u,h=!0)=>{if(!o&&u)for(const[E,k]of Object.entries(u))n.dispatch("content/update",[E,k]);const C=s.merge(u);h&&await s.save(C)}}}function ie(){const t=m();function n(o){return!o||typeof o=="string"?o:o[t.translation.code]??Object.values(o)[0]}return{t:n}}function ae(){const t=N();return{load:({parent:o,name:e})=>t.get(`${o}/sections/${e}`)}}const g=r.computed;r.customRef,r.defineAsyncComponent,r.defineComponent,r.effectScope,r.getCurrentInstance,r.getCurrentScope,r.h,r.inject,r.isProxy,r.isReactive,r.isReadonly,r.isRef,r.isShallow,r.markRaw;const D=r.nextTick;r.onActivated,r.onBeforeMount;const K=r.onBeforeUnmount;r.onBeforeUpdate,r.onDeactivated,r.onErrorCaptured;const se=r.onMounted;r.onRenderTracked,r.onRenderTriggered,r.onScopeDispose,r.onServerPrefetch,r.onUnmounted,r.onUpdated,r.provide,r.proxyRefs,r.reactive,r.readonly;const l=r.ref;r.shallowReactive,r.shallowReadonly,r.shallowRef,r.toRaw,r.toRef,r.toRefs,r.triggerRef;const H=r.unref;r.useAttrs,r.useCssModule,r.useCssVars,r.useListeners,r.useSlots;const V=r.watch;r.watchEffect,r.watchPostEffect,r.watchSyncEffect;const O={en:{"modal.info":"Thanks for purchasing {label}! Please enter your email address and order ID to activate your license.","modal.fields.orderId.help":'<a href="https://app.lemonsqueezy.com/my-orders" target="_blank">Find your order number</a> on Lemon Squeezy or <a href="mailto:hello@kirby.tools">contact us</a> if you cannot find it.',"modal.error.required.fields":"Email address and order ID are required","modal.error.invalid.unauthorized":"Email address or order ID is incorrect","modal.error.invalid.licenseKey":"License key invalid for this plugin","modal.error.incompatible":"License key invalid for this plugin version","modal.error.upgradeable":"License key invalid for this plugin version. Upgrade now on https://hub.kirby.tools.","modal.error.activated":"License key already activated",activate:"Activate",activated:"Plugin activated",buy:"Buy a license",upgrade:"Upgrade"},de:{"modal.info":"Dankeschön für den Kauf von {label}! Bitte gib deine E-Mail-Adresse und Bestellnummer ein, um deine Lizenz zu aktivieren.","modal.fields.orderId.help":'<a href="https://app.lemonsqueezy.com/my-orders" target="_blank">Finde deine Bestellnummer</a> bei Lemon Squeezy oder <a href="mailto:hello@kirby.tools">kontaktiere uns</a>, wenn du sie nicht finden kannst.',"modal.error.required.fields":"E-Mail-Adresse und Bestellnummer sind notwendig","modal.error.invalid.unauthorized":"E-Mail-Adresse oder Bestellnummer ist falsch","modal.error.invalid.licenseKey":"Lizenzschlüssel ungültig für dieses Plugin","modal.error.incompatible":"Lizenzschlüssel ungültig für diese Plugin-Version","modal.error.upgradeable":"Lizenzschlüssel ungültig für diese Plugin-Version. Aktualisiere jetzt auf https://hub.kirby.tools.","modal.error.activated":"Lizenzschlüssel bereits aktiviert",activate:"Aktivieren",activated:"Plugin aktiviert",buy:"Lizenz kaufen",upgrade:"Upgrade"},fr:{"modal.info":"Merci d'avoir acheté {label} ! Veuillez saisir votre adresse e-mail et votre numéro de commande pour activer votre licence.","modal.fields.orderId.help":'<a href="https://app.lemonsqueezy.com/my-orders" target="_blank">Trouvez votre numéro de commande</a> sur Lemon Squeezy ou <a href="mailto:hello@kirby.tools">contactez-nous</a> si vous ne le trouvez pas.',"modal.error.required.fields":"Adresse e-mail et numéro de commande requis","modal.error.invalid.unauthorized":"Adresse e-mail ou numéro de commande incorrect","modal.error.invalid.licenseKey":"Clé de licence invalide pour ce plugin","modal.error.incompatible":"Clé de licence invalide pour cette version du plugin","modal.error.upgradeable":"Clé de licence invalide pour cette version du plugin. Mettez à niveau maintenant sur https://hub.kirby.tools.","modal.error.activated":"Clé de licence déjà activée",activate:"Activer",activated:"Plugin activé",buy:"Acheter une licence",upgrade:"Upgrade"},nl:{"modal.info":"Bedankt voor het kopen van {label}! Voer je e-mailadres en bestelnummer in om je licentie te activeren.","modal.fields.orderId.help":'<a href="https://app.lemonsqueezy.com/my-orders" target="_blank">Vind je bestelnummer</a> op Lemon Squeezy of <a href="mailto:hello@kirby.tools">neem contact met ons op</a> als je het niet kunt vinden.',"modal.error.required.fields":"E-mailadres en bestelnummer zijn verplicht","modal.error.invalid.unauthorized":"E-mailadres of bestelnummer is onjuist","modal.error.invalid.licenseKey":"Licentiesleutel ongeldig voor dit plug-in","modal.error.incompatible":"Licentiesleutel ongeldig voor deze plug-inversie","modal.error.upgradeable":"Licentiesleutel ongeldig voor deze plug-inversie. Upgrade nu op https://hub.kirby.tools.","modal.error.activated":"Licentiesleutel al geactiveerd",activate:"Activeren",activated:"Plugin geactiveerd",buy:"Koop een licentie",upgrade:"Upgrade"}},le=["localhost","127.0.0.1","[::1]"],ce=["local","test","ddev.site"];function b(t="",n){var a;const o=window.panel.translation.code,e=((a=O==null?void 0:O[o])==null?void 0:a[t])??t;return n?ue(e,n):e}function ue(t,n,o){return t.replace(/\{(\w+)\}/g,(e,a)=>n[a]||a)}function de(){const{hostname:t}=window.location,n=le.includes(t),o=ce.some(e=>t.endsWith(`.${e}`));return n||o}const G={Unauthorized:"modal.error.invalid.unauthorized","License key not valid for this plugin":"modal.error.invalid.licenseKey","License key not valid for this plugin version":"modal.error.incompatible","License key not valid for this plugin version, please upgrade your license":"modal.error.upgradeable","License key already activated":"modal.error.activated"};function pe(t){const n=m();return{isLocalhost:de(),assertActivationIntegrity:async({component:i,licenseStatus:s})=>{if(H(s)==="active")return;const d=H(i);if(!(d!=null&&d.$el)||window.getComputedStyle(d.$el).display==="none"||window.getComputedStyle(d.$el).visibility==="hidden"||window.getComputedStyle(d.$el).opacity==="0")throw new Error("Are you trying to hide the activation buttons? Please buy a license.")},openLicenseModal:()=>{let i=!1;const{label:s}=t,d={info:{type:"info",text:b("modal.info",{label:s})},email:{label:n.t("email"),type:"email"},orderId:{label:"Order ID",type:"text",help:b("modal.fields.orderId.help",{label:s})}};return new Promise(u=>{n.dialog.open({component:"k-form-dialog",props:{submitButton:{icon:"check",theme:"love",text:b("activate",{label:s})},fields:d},on:{close:()=>{u({isLicenseActive:i})},submit:async h=>{i=await fe(h,t),i&&(n.dialog.close(),n.notification.success(b("activated")))}}})})}}}async function fe(t,n){const o=m(),{email:e,orderId:a}=t;if(!e||!a)return o.notification.error(b("modal.error.required.fields")),!1;try{const i=await o.api.post(`${n.apiNamespace}/activate`,{email:e,orderId:Number(a)});if((i==null?void 0:i.status)!=="ok")throw new Error("Failed to activate license key");return!0}catch(i){const s=i.message;return o.notification.error(G[s]?b(G[s]):s),!1}}const ve=Vue.defineComponent({__name:"LicensingButtonGroup",props:{label:{type:String,required:!0},apiNamespace:{type:String,required:!0},licenseStatus:{type:String,required:!0},pricingUrl:{type:String,required:!0}},setup(t){const n=t,{openLicenseModal:o,assertActivationIntegrity:e}=pe({label:n.label,apiNamespace:n.apiNamespace}),a=l(n.licenseStatus),i=l();se(()=>{e({component:i,licenseStatus:n.licenseStatus})});async function s(){const{isLicenseActive:d}=await o();d&&window.location.reload()}return{__sfc:!0,props:n,openLicenseModal:o,assertActivationIntegrity:e,currentLicenseStatus:a,licenseButtonGroup:i,handleRegistration:s,t:b}}});function W(t,n,o,e,a,i,s,d){var u=typeof t=="function"?t.options:t;return n&&(u.render=n,u.staticRenderFns=o,u._compiled=!0),i&&(u._scopeId="data-v-"+i),{exports:t,options:u}}var me=function(){var n=this,o=n._self._c,e=n._self._setupProxy;return e.currentLicenseStatus!=="active"?o("k-button-group",{ref:"licenseButtonGroup",attrs:{layout:"collapsed"}},[o("k-button",{attrs:{theme:"love",variant:"filled",size:"xs",link:e.currentLicenseStatus==="upgradeable"?"https://hub.kirby.tools":n.pricingUrl,target:"_blank",text:e.currentLicenseStatus==="upgradeable"?e.t("upgrade"):e.t("buy")}}),o("k-button",{attrs:{theme:"love",variant:"filled",size:"xs",icon:"key",text:e.t("activate")},on:{click:function(a){return e.handleRegistration()}}})],1):n._e()},he=[],ge=W(ve,me,he,!1,null,null);const be=ge.exports,ye={blueprint:String,lock:[Boolean,Object],help:String,name:String,parent:String,timestamp:Number};function we(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function ke(t,n){if(typeof t!="function")throw new TypeError(`Expected the first argument to be a \`function\`, got \`${typeof t}\`.`);let o,e=0;return function(...i){clearTimeout(o);const s=Date.now(),d=s-e,u=n-d;u<=0?(e=s,t.apply(this,i)):o=setTimeout(()=>{e=Date.now(),t.apply(this,i)},u)}}var _e=ke;const Le=we(_e),xe=/^\.?\//;function Se(t="",n){return t.endsWith("/")?t:t+"/"}function Ce(t=""){return t.startsWith("/")}function J(t=""){return Ce(t)?t:"/"+t}function Ee(t){return t&&t!=="/"}function ze(t,...n){let o=t||"";for(const e of n.filter(a=>Ee(a)))if(o){const a=e.replace(xe,"");o=Se(o)+a}else o=e;return o}function Re(){const n=m().languages.map(e=>e.code);return{locales:n,getNonLocalizedPath:e=>{const i=(e instanceof URL?e:new URL(e)).pathname.split("/").filter(Boolean);return n.includes(i[0])&&i.shift(),J(i.join("/"))}}}const Ue="__live-preview__/context";let A,S;function Ae(){return A||S||(S=window.panel.api.get(Ue).then(t=>(A=t,S=void 0,A)),S)}const Q={...ye},Ie=Object.assign({inheritAttrs:!1},{__name:"LivePreview",props:Q,setup(t){const n=t,o=$(),e=m(),a=N(),{t:i}=ie(),{getNonLocalizedPath:s}=Re(),d=l(),u=l(),h=l(),C=l(),E=l(),k=l(),X=l(),I=l(!1),P=l(!1),q=l(!1),_=l(),Y=l(),Z=l(),$e=l(),z=l(),ee=l();let v,B;const j=new AbortController,{contentChanges:R}=re();V(R,p=>{v&&h.value!==!1&&k.value==="interval"&&JSON.stringify(p)!==B&&v(p)}),V(()=>e.language.code,()=>{y()});const F=l(!0),T=l(32),M=l(65),Oe=g(()=>`calc(100dvh - ${F.value?`calc(${T.value}px + 5.75rem)`:"2vh"} - ${M.value}px - 2.75rem`);(async()=>{const{load:p}=ae(),[w,c]=await Promise.all([Ae(),p({parent:n.parent,name:n.name})]);d.value=i(c.label)||e.t("johannschopplich.preview.label"),u.value=c.pageId,h.value=c.updateInterval,C.value=c.interactable,E.value=c.aspectRatio||void 0,k.value=c.updateStrategy,X.value=c.help,Z.value=w.licenseStatus,v=Le(te,h.value||250),y(),await D();const f=document.querySelector(".k-topbar"),U=document.querySelector(".k-header");if(!E.value&&f&&U){T.value=f.offsetHeight,M.value=U.offsetHeight;const L=new IntersectionObserver(([x])=>{F.value=x.isIntersecting,x.isIntersecting&&(T.value=x.target.offsetHeight)},{threshold:[0],rootMargin:"64px 0px 0px 0px"});L.observe(f),K(L.disconnect)}window.addEventListener("message",ne,{signal:j.signal}),e.events.on("page.changeTitle",y),e.events.on("file.sort",y),k.value==="blur"&&document.body.addEventListener("blur",()=>{JSON.stringify(R.value)!==B&&(v==null||v(R.value))},{capture:!0,signal:j.signal})})(),K(()=>{j.abort(),e.events.off("page.changeTitle",y),e.events.off("file.sort",y),_.value&&URL.revokeObjectURL(_.value)});function y(p){v==null||v(R.value,p)}async function te(p,{persistScrollPosition:w=!0}={}){var f,U;if(I.value)return;I.value=!0;let c=0;z.value&&(c=z.value.contentWindow.scrollY,(U=(f=ee.value)==null?void 0:f.contentWindow)==null||U.scrollTo(0,c)),P.value=!0;try{const{data:L}=await a.post("__live-preview__/render",{pageId:u.value,content:p,interactable:C.value,model:e.view.path==="site"?"site":"page"}),x=_.value,qe=new Blob([L],{type:"text/html"});_.value=URL.createObjectURL(qe),await D(),await new Promise(Fe=>{z.value.addEventListener("load",()=>{c&&w&&z.value.contentWindow.scrollTo(0,c),Fe()},{once:!0})}),P.value=!1,q.value=!1,Y.value=_.value,B=JSON.stringify(p),x&&URL.revokeObjectURL(x)}catch(L){console.error(L),q.value=!0,P.value=!1}finally{I.value=!1}}async function ne({data:p}){if(p.type==="save"){e.events.emit(`${e.context}.save`);return}if(p.type==="link"){const w=new URL(p.href);if(w.origin!==window.location.origin){window.open(p.href,"_blank");return}if(["assets","media"].some(f=>w.pathname.startsWith(`/${f}/`)))return;let c=s(w).slice(1);c?(c=c.replace(/\/[^/]+?:.+$/,""),c=ze("pages",c.replaceAll("/","+"))):c="site";try{e.isLoading=!0;const f=await e.get(J(c));e.set(f),e.isLoading=!1}catch(f){console.error(f)}}}return{__sfc:!0,propsDefinition:Q,props:n,_isKirby5:o,panel:e,api:a,t:i,getNonLocalizedPath:s,label:d,pageId:u,updateInterval:h,interactable:C,aspectRatio:E,updateStrategy:k,help:X,isRendering:I,showTransitionIframe:P,hasError:q,blobUrl:_,transitionBlobUrl:Y,licenseStatus:Z,container:$e,iframe:z,transitionIframe:ee,throttledRenderPreview:v,lastRenderedContent:B,eventsController:j,contentChanges:R,isTopbarVisible:F,topbarHeight:T,headerHeight:M,containerHeight:Oe,renderUnsavedContent:y,renderPreview:te,handleMessage:ne,LicensingButtonGroup:be}}});var Pe=function(){var n=this,o=n._self._c,e=n._self._setupProxy;return o("k-section",{attrs:{label:e.label}},[o("div",{staticClass:"klp-flex klp-items-center klp-gap-2",attrs:{slot:"options"},slot:"options"},[e.licenseStatus!==void 0?o(e.LicensingButtonGroup,{attrs:{label:"Kirby Live Preview","api-namespace":"__live-preview__","license-status":e.licenseStatus,"pricing-url":"https://kirby.tools/live-preview#pricing"}}):n._e(),o("k-button",{attrs:{variant:"filled",size:"xs",icon:"live-preview-restart"},on:{click:function(a){return e.renderUnsavedContent()}}})],1),o("div",{ref:"container",staticClass:"klp-grid klp-min-h-[55dvh] klp-rounded-[var(--input-rounded)]",class:[e.isRendering&&"klp-pointer-events-none",e.transitionBlobUrl&&!e.hasError&&"k-shadow-md",(!e.transitionBlobUrl||e.hasError)&&"klp-border klp-border-dashed klp-border-[var(--preview-color-border)]"],style:{"--preview-color-border":e._isKirby5?"light-dark(var(--color-gray-400),var(--color-border))":"var(--color-gray-400)",aspectRatio:e.aspectRatio,height:e.aspectRatio?"auto":e.containerHeight,maxWidth:"100%"},attrs:{"data-theme":"passive"}},[e.transitionBlobUrl?o("iframe",{ref:"transitionIframe",staticClass:"klp-h-full klp-w-full klp-rounded-[var(--input-rounded)] klp-bg-[var(--input-color-back)]",class:[e.hasError&&"klp-pointer-events-none klp-opacity-0"],style:{gridArea:"1 / 1 / 1 / 1"},attrs:{src:e.transitionBlobUrl}}):n._e(),e.blobUrl?o("iframe",{ref:"iframe",staticClass:"klp-h-full klp-w-full klp-rounded-[var(--input-rounded)] klp-bg-[var(--input-color-back)]",class:[(e.showTransitionIframe||e.hasError)&&"klp-pointer-events-none klp-opacity-0"],style:{gridArea:"1 / 1 / 1 / 1"},attrs:{src:e.blobUrl}}):n._e(),e.hasError?o("div",{staticClass:"klp-flex klp-items-center klp-justify-center",style:{gridArea:"1 / 1 / 1 / 1"}},[o("k-button",{attrs:{variant:"filled",theme:"notice",icon:"alert",text:e.panel.t("johannschopplich.preview.error.render")},on:{click:function(a){return e.renderUnsavedContent({persistScrollPosition:!1})}}})],1):n._e()]),e.help?o("k-text",{staticClass:"k-help klp-mt-2",attrs:{html:e.help}}):n._e()],1)},Be=[],je=W(Ie,Pe,Be,!1,null,"012a10ac");const Te=je.exports;window.panel.plugin("johannschopplich/live-preview",{sections:{preview:Te},icons:{"live-preview-restart":'<path d="M18.537 19.567A9.961 9.961 0 0 1 12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10c0 2.136-.67 4.116-1.81 5.74L17 12h3a8 8 0 1 0-2.46 5.772z" />'}})})();
