(function(){"use strict";const r=window.Vue;function h(){return window.panel}function $(){return h().api}const F=()=>window.panel.plugins.viewButtons!==void 0;function re(){const t=h().app.$store;return t||new Proxy({},{get(){throw new Error("Vuex store is not available. Are you using Kirby 5? Use the `useContent` composable instead.")}})}function oe(){const t=h(),n=re(),o=F(),e=k(o?()=>t.view.props.content:()=>n.getters["content/values"]()),a=k(o?()=>t.content.changes():()=>n.getters["content/changes"]()),i=k(o?()=>Object.keys(a.value).length>0:()=>n.getters["content/hasChanges"]()),s=o?t.content:new Proxy({},{get(){return()=>{}}});return{content:s,currentContent:e,contentChanges:a,hasChanges:i,update:async(d,y=!0)=>{if(!o&&d)for(const[b,z]of Object.entries(d))n.dispatch("content/update",[b,z]);const E=s.merge(d);y&&await s.save(E)}}}function ie(){const t=$();return{load:({parent:o,name:e})=>t.get(`${o}/sections/${e}`)}}const k=r.computed;r.customRef,r.defineAsyncComponent,r.defineComponent,r.effectScope,r.getCurrentInstance,r.getCurrentScope,r.h,r.inject,r.isProxy,r.isReactive,r.isReadonly,r.isRef,r.isShallow,r.markRaw;const N=r.nextTick;r.onActivated,r.onBeforeMount;const ae=r.onBeforeUnmount;r.onBeforeUpdate,r.onDeactivated,r.onErrorCaptured;const se=r.onMounted;r.onRenderTracked,r.onRenderTriggered,r.onScopeDispose,r.onServerPrefetch,r.onUnmounted,r.onUpdated,r.provide,r.proxyRefs,r.reactive,r.readonly;const l=r.ref;r.shallowReactive,r.shallowReadonly,r.shallowRef,r.toRaw,r.toRef,r.toRefs,r.triggerRef;const M=r.unref;r.useAttrs,r.useCssModule,r.useCssVars,r.useListeners,r.useSlots;const q=r.watch;r.watchEffect,r.watchPostEffect,r.watchSyncEffect;const P={en:{"modal.info":"Thanks for purchasing {label}! Please enter your email address and order ID to activate your license.","modal.fields.orderId.help":'<a href="https://app.lemonsqueezy.com/my-orders" target="_blank">Find your order number</a> on Lemon Squeezy or <a href="mailto:hello@kirby.tools">contact us</a> if you cannot find it.',"modal.error.required.fields":"Email address and order ID are required","modal.error.invalid.unauthorized":"Email address or order ID is incorrect","modal.error.invalid.licenseKey":"License key invalid for this plugin","modal.error.incompatible":"License key invalid for this plugin version","modal.error.upgradeable":"License key invalid for this plugin version. Upgrade now on https://hub.kirby.tools.","modal.error.activated":"License key already activated",activate:"Activate",activated:"Plugin activated",buy:"Buy a license",upgrade:"Upgrade"},de:{"modal.info":"Dankeschön für den Kauf von {label}! Bitte gib deine E-Mail-Adresse und Bestellnummer ein, um deine Lizenz zu aktivieren.","modal.fields.orderId.help":'<a href="https://app.lemonsqueezy.com/my-orders" target="_blank">Finde deine Bestellnummer</a> bei Lemon Squeezy oder <a href="mailto:hello@kirby.tools">kontaktiere uns</a>, wenn du sie nicht finden kannst.',"modal.error.required.fields":"E-Mail-Adresse und Bestellnummer sind notwendig","modal.error.invalid.unauthorized":"E-Mail-Adresse oder Bestellnummer ist falsch","modal.error.invalid.licenseKey":"Lizenzschlüssel ungültig für dieses Plugin","modal.error.incompatible":"Lizenzschlüssel ungültig für diese Plugin-Version","modal.error.upgradeable":"Lizenzschlüssel ungültig für diese Plugin-Version. Aktualisiere jetzt auf https://hub.kirby.tools.","modal.error.activated":"Lizenzschlüssel bereits aktiviert",activate:"Aktivieren",activated:"Plugin aktiviert",buy:"Lizenz kaufen",upgrade:"Upgrade"},fr:{"modal.info":"Merci d'avoir acheté {label} ! Veuillez saisir votre adresse e-mail et votre numéro de commande pour activer votre licence.","modal.fields.orderId.help":'<a href="https://app.lemonsqueezy.com/my-orders" target="_blank">Trouvez votre numéro de commande</a> sur Lemon Squeezy ou <a href="mailto:hello@kirby.tools">contactez-nous</a> si vous ne le trouvez pas.',"modal.error.required.fields":"Adresse e-mail et numéro de commande requis","modal.error.invalid.unauthorized":"Adresse e-mail ou numéro de commande incorrect","modal.error.invalid.licenseKey":"Clé de licence invalide pour ce plugin","modal.error.incompatible":"Clé de licence invalide pour cette version du plugin","modal.error.upgradeable":"Clé de licence invalide pour cette version du plugin. Mettez à niveau maintenant sur https://hub.kirby.tools.","modal.error.activated":"Clé de licence déjà activée",activate:"Activer",activated:"Plugin activé",buy:"Acheter une licence",upgrade:"Upgrade"},nl:{"modal.info":"Bedankt voor het kopen van {label}! Voer je e-mailadres en bestelnummer in om je licentie te activeren.","modal.fields.orderId.help":'<a href="https://app.lemonsqueezy.com/my-orders" target="_blank">Vind je bestelnummer</a> op Lemon Squeezy of <a href="mailto:hello@kirby.tools">neem contact met ons op</a> als je het niet kunt vinden.',"modal.error.required.fields":"E-mailadres en bestelnummer zijn verplicht","modal.error.invalid.unauthorized":"E-mailadres of bestelnummer is onjuist","modal.error.invalid.licenseKey":"Licentiesleutel ongeldig voor dit plug-in","modal.error.incompatible":"Licentiesleutel ongeldig voor deze plug-inversie","modal.error.upgradeable":"Licentiesleutel ongeldig voor deze plug-inversie. Upgrade nu op https://hub.kirby.tools.","modal.error.activated":"Licentiesleutel al geactiveerd",activate:"Activeren",activated:"Plugin geactiveerd",buy:"Koop een licentie",upgrade:"Upgrade"}},le=["localhost","127.0.0.1","[::1]"],ce=["local","test","ddev.site"];function g(t="",n){var a;const o=window.panel.translation.code,e=((a=P==null?void 0:P[o])==null?void 0:a[t])??t;return n?ue(e,n):e}function ue(t,n,o){return t.replace(/\{(\w+)\}/g,(e,a)=>n[a]||a)}function de(){const{hostname:t}=window.location,n=le.includes(t),o=ce.some(e=>t.endsWith(`.${e}`));return n||o}const D={Unauthorized:"modal.error.invalid.unauthorized","License key not valid for this plugin":"modal.error.invalid.licenseKey","License key not valid for this plugin version":"modal.error.incompatible","License key not valid for this plugin version, please upgrade your license":"modal.error.upgradeable","License key already activated":"modal.error.activated"};function pe(t){const n=h();return{isLocalhost:de(),assertActivationIntegrity:async({component:i,licenseStatus:s})=>{if(M(s)==="active")return;const c=M(i);if(!(c!=null&&c.$el)||window.getComputedStyle(c.$el).display==="none"||window.getComputedStyle(c.$el).visibility==="hidden"||window.getComputedStyle(c.$el).opacity==="0")throw new Error("Are you trying to hide the activation buttons? Please buy a license.")},openLicenseModal:()=>{let i=!1;const{label:s}=t,c={info:{type:"info",text:g("modal.info",{label:s})},email:{label:n.t("email"),type:"email"},orderId:{label:"Order ID",type:"text",help:g("modal.fields.orderId.help",{label:s})}};return new Promise(d=>{n.dialog.open({component:"k-form-dialog",props:{submitButton:{icon:"check",theme:"love",text:g("activate",{label:s})},fields:c},on:{close:()=>{d({isLicenseActive:i})},submit:async y=>{i=await ve(y,t),i&&(n.dialog.close(),n.notification.success(g("activated")))}}})})}}}async function ve(t,n){const o=h(),{email:e,orderId:a}=t;if(!e||!a)return o.notification.error(g("modal.error.required.fields")),!1;try{const i=await o.api.post(`${n.apiNamespace}/activate`,{email:e,orderId:Number(a)});if((i==null?void 0:i.status)!=="ok")throw new Error("Failed to activate license key");return!0}catch(i){const s=i.message;return o.notification.error(D[s]?g(D[s]):s),!1}}const fe=Vue.defineComponent({__name:"LicensingButtonGroup",props:{label:{type:String,required:!0},apiNamespace:{type:String,required:!0},licenseStatus:{type:String,required:!0},pricingUrl:{type:String,required:!0}},setup(t){const n=t,{openLicenseModal:o,assertActivationIntegrity:e}=pe({label:n.label,apiNamespace:n.apiNamespace}),a=l(n.licenseStatus),i=l();se(()=>{e({component:i,licenseStatus:n.licenseStatus})});async function s(){const{isLicenseActive:c}=await o();c&&window.location.reload()}return{__sfc:!0,props:n,openLicenseModal:o,assertActivationIntegrity:e,currentLicenseStatus:a,licenseButtonGroup:i,handleRegistration:s,t:g}}});function K(t,n,o,e,a,i,s,c){var d=typeof t=="function"?t.options:t;return n&&(d.render=n,d.staticRenderFns=o,d._compiled=!0),i&&(d._scopeId="data-v-"+i),{exports:t,options:d}}var me=function(){var n=this,o=n._self._c,e=n._self._setupProxy;return e.currentLicenseStatus!=="active"?o("k-button-group",{ref:"licenseButtonGroup",attrs:{layout:"collapsed"}},[o("k-button",{attrs:{theme:"love",variant:"filled",size:"xs",link:e.currentLicenseStatus==="upgradeable"?"https://hub.kirby.tools":n.pricingUrl,target:"_blank",text:e.currentLicenseStatus==="upgradeable"?e.t("upgrade"):e.t("buy")}}),o("k-button",{attrs:{theme:"love",variant:"filled",size:"xs",icon:"key",text:e.t("activate")},on:{click:function(a){return e.handleRegistration()}}})],1):n._e()},he=[],ge=K(fe,me,he,!1,null,null);const ye=ge.exports,be={blueprint:String,lock:[Boolean,Object],help:String,name:String,parent:String,timestamp:Number};function we(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function ke(t,n){if(typeof t!="function")throw new TypeError(`Expected the first argument to be a \`function\`, got \`${typeof t}\`.`);let o,e=0;return function(...i){clearTimeout(o);const s=Date.now(),c=s-e,d=n-c;d<=0?(e=s,t.apply(this,i)):o=setTimeout(()=>{e=Date.now(),t.apply(this,i)},d)}}var _e=ke;const Le=we(_e),Se=/^\.?\//;function Ce(t="",n){return t.endsWith("/")?t:t+"/"}function xe(t=""){return t.startsWith("/")}function V(t=""){return xe(t)?t:"/"+t}function Ee(t){return t&&t!=="/"}function ze(t,...n){let o=t||"";for(const e of n.filter(a=>Ee(a)))if(o){const a=e.replace(Se,"");o=Ce(o)+a}else o=e;return o}function Re(){const n=h().languages.map(e=>e.code);return{locales:n,getNonLocalizedPath:e=>{const i=(e instanceof URL?e:new URL(e)).pathname.split("/").filter(Boolean);return n.includes(i[0])&&i.shift(),V(i.join("/"))}}}const Ue="__live-preview__/context",Ae=["error","warn","info","debug"];let x,S;function Pe(){return x||S||(S=window.panel.api.get(Ue).then(t=>(x=t,S=void 0,x)),S)}const G={...be},Ie=Object.assign({inheritAttrs:!1},{__name:"Preview",props:G,setup(t){const n=t,o=F(),e=h(),a=$(),{getNonLocalizedPath:i}=Re(),s=l(),c=l(),d=l(),y=l(),E=l(),b=l(),z=l(),R=l(!1),U=l(!1),I=l(!1),_=l(),W=l(),J=l({}),H=l(),Q=l(),C=l(),X=l();let v,B;const{contentChanges:L}=oe();q(L,(u,m)=>{v&&c.value!==!1&&b.value==="interval"&&JSON.stringify(u)!==JSON.stringify(m)&&v(u)},{deep:!0}),q(()=>e.language.code,()=>{w()}),(async()=>{const{load:u}=ie(),[m,p]=await Promise.all([Pe(),u({parent:n.parent,name:n.name})]);s.value=Z(p.label)||e.t("johannschopplich.preview.label"),c.value=p.updateInterval,d.value=p.interactable,y.value=p.aspectRatio||void 0,E.value=Ae.indexOf(p.logLevel),b.value=p.updateStrategy,z.value=p.help,H.value=m.licenseStatus,v=Le(Y,c.value||250),w(),await N(),y.value||(A(),window.addEventListener("resize",A)),window.addEventListener("message",O),e.events.on("page.changeTitle",w),e.events.on("file.sort",w),b.value==="blur"&&document.body.addEventListener("blur",j,!0)})(),ae(()=>{b.value==="blur"&&document.body.removeEventListener("blur",j,!0),window.removeEventListener("resize",A),window.removeEventListener("message",O),e.events.off("page.changeTitle",w),e.events.off("file.sort",w),_.value&&URL.revokeObjectURL(_.value)});function A(){J.value=Q.value.getBoundingClientRect()}function w(u){v==null||v(L.value,u)}function j(){JSON.stringify(L.value)!==B&&(v==null||v(L.value),B=JSON.stringify(L.value))}async function Y(u,{persistScrollPosition:m=!0}={}){var ee,te;if(R.value)return;R.value=!0;const p=e.view.path.startsWith("pages/")?e.view.path.slice(6).replaceAll("+","/"):void 0;let f=0;C.value&&(f=C.value.contentWindow.scrollY,(te=(ee=X.value)==null?void 0:ee.contentWindow)==null||te.scrollTo(0,f)),U.value=!0;try{const{html:T}=await a.post("__live-preview__/render",{id:p,content:u,interactable:d.value}),ne=_.value,$e=new Blob([T],{type:"text/html"});_.value=URL.createObjectURL($e),await N(),await new Promise(Fe=>{C.value.addEventListener("load",()=>{f&&m&&C.value.contentWindow.scrollTo(0,f),Fe()},{once:!0})}),U.value=!1,I.value=!1,W.value=_.value,ne&&URL.revokeObjectURL(ne)}catch(T){console.error(T),I.value=!0,U.value=!1}finally{R.value=!1}}async function O({data:u}){if(u.type==="save"){e.events.emit(`${e.context}.save`);return}if(u.type==="link"){const m=new URL(u.href);if(m.origin!==window.location.origin){window.open(u.href,"_blank");return}if(["assets","media"].some(f=>m.pathname.startsWith(`/${f}/`)))return;let p=i(m).slice(1);p?(p=p.replace(/\/[^/]+?:.+$/,""),p=ze("pages",p.replaceAll("/","+"))):p="site";try{e.isLoading=!0;const f=await e.get(V(p));e.set(f),e.isLoading=!1}catch(f){console.error(f)}}}function Z(u){return!u||typeof u=="string"?u:u[e.translation.code]??Object.values(u)[0]}return{__sfc:!0,propsDefinition:G,props:n,_isKirby5:o,panel:e,api:a,getNonLocalizedPath:i,label:s,updateInterval:c,interactable:d,aspectRatio:y,logLevel:E,updateStrategy:b,help:z,isRendering:R,showTransitionIframe:U,hasError:I,blobUrl:_,transitionBlobUrl:W,containerRect:J,licenseStatus:H,container:Q,iframe:C,transitionIframe:X,throttledRenderPreview:v,lastUnsavedContent:B,contentChanges:L,updateSectionHeight:A,renderUnsavedContent:w,renderMaybeUnsavedContent:j,renderPreview:Y,handleMessage:O,t:Z,LicensingButtonGroup:ye}}});var Be=function(){var n=this,o=n._self._c,e=n._self._setupProxy;return o("k-section",{attrs:{label:e.label}},[o("div",{staticClass:"klp-flex klp-items-center klp-gap-2",attrs:{slot:"options"},slot:"options"},[e.licenseStatus!==void 0?o(e.LicensingButtonGroup,{attrs:{label:"Kirby Live Preview","api-namespace":"__live-preview__","license-status":e.licenseStatus,"pricing-url":"https://kirby.tools/live-preview#pricing"}}):n._e(),o("k-button",{attrs:{variant:"filled",size:"xs",icon:"live-preview-restart"},on:{click:function(a){return e.renderUnsavedContent()}}})],1),o("div",{ref:"container",staticClass:"klp-grid klp-min-h-[55dvh] klp-rounded-[var(--input-rounded)]",class:[e.isRendering&&"klp-pointer-events-none",e.transitionBlobUrl&&!e.hasError&&"k-shadow-md",(!e.transitionBlobUrl||e.hasError)&&"klp-border klp-border-dashed klp-border-[var(--audit-color-border)]"],style:{"--audit-color-border":e._isKirby5?"light-dark(var(--color-gray-400),var(--color-border))":"var(--color-gray-400)",aspectRatio:e.aspectRatio,height:e.aspectRatio?"auto":`calc(100dvh - ${e.containerRect.top??0}px - var(--spacing-3))`,maxWidth:"100%"},attrs:{"data-theme":"passive"}},[e.transitionBlobUrl?o("iframe",{ref:"transitionIframe",staticClass:"klp-h-full klp-w-full klp-rounded-[var(--input-rounded)] klp-bg-[var(--input-color-back)]",class:[e.hasError&&"klp-pointer-events-none klp-opacity-0"],style:{gridArea:"1 / 1 / 1 / 1"},attrs:{src:e.transitionBlobUrl}}):n._e(),e.blobUrl?o("iframe",{ref:"iframe",staticClass:"klp-h-full klp-w-full klp-rounded-[var(--input-rounded)] klp-bg-[var(--input-color-back)]",class:[(e.showTransitionIframe||e.hasError)&&"klp-pointer-events-none klp-opacity-0"],style:{gridArea:"1 / 1 / 1 / 1"},attrs:{src:e.blobUrl}}):n._e(),e.hasError?o("div",{staticClass:"klp-flex klp-items-center klp-justify-center",style:{gridArea:"1 / 1 / 1 / 1"}},[o("k-button",{attrs:{variant:"filled",theme:"notice",icon:"alert",text:e.panel.t("johannschopplich.preview.error.render")},on:{click:function(a){return e.renderUnsavedContent({persistScrollPosition:!1})}}})],1):n._e()]),e.help?o("k-text",{staticClass:"k-help klp-mt-2",attrs:{html:e.help}}):n._e()],1)},je=[],Oe=K(Ie,Be,je,!1,null,"445deccd");const Te=Oe.exports;window.panel.plugin("johannschopplich/live-preview",{sections:{preview:Te},icons:{"live-preview-restart":'<path d="M18.537 19.567A9.961 9.961 0 0 1 12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10c0 2.136-.67 4.116-1.81 5.74L17 12h3a8 8 0 1 0-2.46 5.772z" />'}})})();
