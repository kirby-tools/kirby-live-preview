(function(){"use strict";function k(){return window.panel}function I(){return k().api}function ee(){const o=I();return{load:({parent:e,name:t})=>o.get(`${e}/sections/${t}`)}}function te(){return k().app.$store}const n=window.Vue,ne=n.computed;n.customRef,n.defineAsyncComponent,n.defineComponent,n.effectScope,n.getCurrentInstance,n.getCurrentScope,n.h,n.inject,n.isProxy,n.isReactive,n.isReadonly,n.isRef,n.isShallow,n.markRaw;const B=n.nextTick;n.onActivated,n.onBeforeMount;const oe=n.onBeforeUnmount;n.onBeforeUpdate,n.onDeactivated,n.onErrorCaptured,n.onMounted,n.onRenderTracked,n.onRenderTriggered,n.onScopeDispose,n.onServerPrefetch,n.onUnmounted,n.onUpdated,n.provide,n.proxyRefs,n.reactive,n.readonly;const l=n.ref;n.shallowReactive,n.shallowReadonly,n.shallowRef,n.toRaw,n.toRef,n.toRefs,n.triggerRef;const F=n.unref;n.useAttrs,n.useCssModule,n.useCssVars,n.useListeners,n.useSlots;const D=n.watch;n.watchEffect,n.watchPostEffect,n.watchSyncEffect;const P={en:{"modal.info":"Thanks for purchasing {label}! Please enter your email address and order ID to activate your license.","modal.fields.orderId.help":'<a href="https://app.lemonsqueezy.com/my-orders" target="_blank">Find your order number</a> on Lemon Squeezy or <a href="mailto:hello@kirby.tools">contact us</a> if you cannot find it.',"modal.error.required.fields":"Email address and order ID are required","modal.error.invalid.unauthorized":"Email address or order ID is incorrect","modal.error.invalid.licenseKey":"License key invalid for this plugin","modal.error.incompatible.licenseKey":"License key invalid for this plugin version","modal.error.registered":"License key already registered",activate:"Activate",activated:"Plugin activated"},de:{"modal.info":"Dankeschön für den Kauf von {label}! Bitte gib deine E-Mail-Adresse und Bestellnummer ein, um deine Lizenz zu aktivieren.","modal.fields.orderId.help":'<a href="https://app.lemonsqueezy.com/my-orders" target="_blank">Finde deine Bestellnummer</a> bei Lemon Squeezy oder <a href="mailto:hello@kirby.tools">kontaktiere uns</a>, wenn du sie nicht finden kannst.',"modal.error.required.fields":"E-Mail-Adresse und Bestellnummer sind notwendig","modal.error.invalid.unauthorized":"E-Mail-Adresse oder Bestellnummer ist falsch","modal.error.invalid.licenseKey":"Lizenzschlüssel ungültig für dieses Plugin","modal.error.incompatible.licenseKey":"Lizenzschlüssel ungültig für diese Plugin-Version","modal.error.registered":"Lizenzschlüssel bereits registriert",activate:"Aktivieren",activated:"Plugin aktiviert"},fr:{"modal.info":"Merci d'avoir acheté {label} ! Veuillez saisir votre adresse e-mail et votre numéro de commande pour activer votre licence.","modal.fields.orderId.help":'<a href="https://app.lemonsqueezy.com/my-orders" target="_blank">Trouvez votre numéro de commande</a> sur Lemon Squeezy ou <a href="mailto:hello@kirby.tools">contactez-nous</a> si vous ne le trouvez pas.',"modal.error.required.fields":"Adresse e-mail et numéro de commande requis","modal.error.invalid.unauthorized":"Adresse e-mail ou numéro de commande incorrect","modal.error.invalid.licenseKey":"Clé de licence invalide pour ce plugin","modal.error.incompatible.licenseKey":"Clé de licence invalide pour cette version du plugin","modal.error.registered":"Clé de licence déjà enregistrée",activate:"Activer",activated:"Plugin activé"}};function g(o,r,e){var v;const a=k().translation.code,c=((v=P==null?void 0:P[a])==null?void 0:v[o])??e;if(c)return r?re(c,r):c}function re(o,r,e){return o.replace(/\{(\w+)\}/g,(t,a)=>r[a]||a)}const ie=["localhost","127.0.0.1","[::1]"],ae=["local","test","ddev.site"];function se({label:o,apiNamespace:r}){const e=k(),t=I(),a=le(),c=async(s,f)=>{if(!s||!f)throw new Error("Email and order ID are required");const d=await t.post(`${r}/register`,{email:s,orderId:f});if((d==null?void 0:d.status)!=="ok")throw new Error("Registration failed");return!0};return{isLocalhost:a,assertActivationIntegrity:async({component:s,licenseStatus:f})=>{if(F(f)==="active")return;await B();const d=F(s);if(!(d!=null&&d.$el)||window.getComputedStyle(d.$el).display==="none"||window.getComputedStyle(d.$el).visibility==="hidden"||window.getComputedStyle(d.$el).opacity==="0")throw new Error("Are you trying to hide the activation buttons? Please buy a license.")},openLicenseModal:()=>{let s=!1;return new Promise(f=>{e.dialog.open({component:"k-form-dialog",props:{submitButton:{icon:"check",theme:"love",text:g("activate",{label:o})},fields:{info:{type:"info",text:g("modal.info",{label:o})},email:{label:e.t("email"),type:"email"},orderId:{label:"Order ID",type:"text",help:g("modal.fields.orderId.help",{label:o})}}},on:{close:()=>{f({isRegistered:s})},submit:async d=>{const{email:_,orderId:x}=d;if(!_||!x){e.notification.error(g("modal.error.required.fields"));return}try{await c(_,Number(x))}catch(w){let p=w.message;p==="Unauthorized"?p=g("modal.error.invalid.unauthorized"):p==="License key not valid for this plugin"?p=g("modal.error.invalid.licenseKey"):p==="License key not valid for this plugin version"?p=g("modal.error.incompatible.licenseKey"):p==="License key already registered"&&(p=g("modal.error.registered")),e.notification.error(p);return}s=!0,e.dialog.close(),e.notification.success(g("activated"))}}})})}}}function le(){const{hostname:o}=window.location,r=ie.includes(o),e=ae.some(t=>o.endsWith(`.${t}`));return r||e}const ce={blueprint:String,lock:[Boolean,Object],help:String,name:String,parent:String,timestamp:Number};function de(o){return o&&o.__esModule&&Object.prototype.hasOwnProperty.call(o,"default")?o.default:o}function ue(o,r){if(typeof o!="function")throw new TypeError(`Expected the first argument to be a \`function\`, got \`${typeof o}\`.`);let e,t=0;return function(...c){clearTimeout(e);const v=Date.now(),L=v-t,s=r-L;s<=0?(t=v,o.apply(this,c)):e=setTimeout(()=>{t=Date.now(),o.apply(this,c)},s)}}var pe=ue;const fe=de(pe),ve=/^\.?\//;function me(o="",r){return o.endsWith("/")?o:o+"/"}function he(o=""){return o.startsWith("/")}function N(o=""){return he(o)?o:"/"+o}function ge(o){return o&&o!=="/"}function ye(o,...r){let e=o||"";for(const t of r.filter(a=>ge(a)))if(e){const a=t.replace(ve,"");e=me(e)+a}else e=t;return e}function we(){const r=k().languages.map(t=>t.code);return{locales:r,getNonLocalizedPath:t=>{const c=(t instanceof URL?t:new URL(t)).pathname.split("/").filter(Boolean);return r.includes(c[0])&&c.shift(),N(c.join("/"))}}}const be=["error","warn","info","debug"];function ke(o,r,e,t,a,c,v,L){var s=typeof o=="function"?o.options:o;return r&&(s.render=r,s.staticRenderFns=e,s._compiled=!0),s._scopeId="data-v-"+c,{exports:o,options:s}}const q={...ce},Le=Object.assign({inheritAttrs:!1},{__name:"Preview",props:q,setup(o){const r=o,e=k(),t=I(),a=te(),{getNonLocalizedPath:c}=we(),{openLicenseModal:v,assertActivationIntegrity:L}=se({label:"Kirby Live Preview",apiNamespace:"__live-preview__"}),s=l(),f=l(),d=l(),_=l(),x=l(),w=l(),p=l(),S=l(),z=l(!1),U=l(!1),O=l(!1),E=l(),K=l(),W=l({}),J=l(),R=l(),V=l(),G=l();let m,j;const C=ne(()=>a.getters["content/changes"]());D(C,(i,u)=>{m&&f.value!==!1&&w.value==="interval"&&JSON.stringify(i)!==JSON.stringify(u)&&m(i)},{deep:!0}),D(()=>e.language.code,()=>{b()}),(async()=>{const{load:i}=ee(),u=await i({parent:r.parent,name:r.name});s.value=Q(u.label)||e.t("johannschopplich.preview.label"),f.value=u.updateInterval,d.value=u.interactable,_.value=u.aspectRatio||void 0,x.value=be.indexOf(u.logLevel),w.value=u.updateStrategy,p.value=u.help,S.value=u.license,L({component:G,licenseStatus:S.value}),m=fe(H,f.value||250),b(),await B(),_.value||(A(),window.addEventListener("resize",A)),window.addEventListener("message",$),e.events.on("page.changeTitle",b),e.events.on("file.sort",b),w.value==="blur"&&document.body.addEventListener("blur",T,!0)})(),oe(()=>{w.value==="blur"&&document.body.removeEventListener("blur",T,!0),window.removeEventListener("resize",A),window.removeEventListener("message",$),e.events.off("page.changeTitle",b),e.events.off("file.sort",b),E.value&&URL.revokeObjectURL(E.value)});function A(){W.value=J.value.getBoundingClientRect()}function b(i){m==null||m(C.value,i)}function T(){JSON.stringify(C.value)!==j&&(m==null||m(C.value),j=JSON.stringify(C.value))}async function H(i,{persistScrollPosition:u=!0}={}){var Y,X;if(z.value)return;z.value=!0;const y=e.view.path.startsWith("pages/")?e.view.path.slice(6).replaceAll("+","/"):void 0;let h=0;R.value&&(h=R.value.contentWindow.scrollY,(X=(Y=V.value)==null?void 0:Y.contentWindow)==null||X.scrollTo(0,h)),U.value=!0;try{const{html:M}=await t.post("__live-preview__/render",{id:y,content:i,interactable:d.value}),Z=E.value,Se=new Blob([M],{type:"text/html"});E.value=URL.createObjectURL(Se),await B(),await new Promise(ze=>{R.value.addEventListener("load",()=>{h&&u&&R.value.contentWindow.scrollTo(0,h),ze()},{once:!0})}),U.value=!1,O.value=!1,K.value=E.value,Z&&URL.revokeObjectURL(Z)}catch(M){console.error(M),O.value=!0,U.value=!1}finally{z.value=!1}}async function $({data:i}){if(i.type==="save"){e.events.emit(`${e.context}.save`);return}if(i.type==="link"){const u=new URL(i.href);if(u.origin!==window.location.origin){window.open(i.href,"_blank");return}if(["assets","media"].some(h=>u.pathname.startsWith(`/${h}/`)))return;let y=c(u).slice(1);y?(y=y.replace(/\/[^/]+?:.+$/,""),y=ye("pages",y.replaceAll("/","+"))):y="site";try{e.isLoading=!0;const h=await e.get(N(y));e.set(h),e.isLoading=!1}catch(h){console.error(h)}}}function Q(i){return!i||typeof i=="string"?i:i[e.translation.code]??Object.values(i)[0]}async function Re(){const{isRegistered:i}=await v();i&&(S.value="active")}return{__sfc:!0,propsDefinition:q,props:r,panel:e,api:t,store:a,getNonLocalizedPath:c,openLicenseModal:v,assertActivationIntegrity:L,label:s,updateInterval:f,interactable:d,aspectRatio:_,logLevel:x,updateStrategy:w,help:p,license:S,isRendering:z,showTransitionIframe:U,hasError:O,blobUrl:E,transitionBlobUrl:K,containerRect:W,container:J,iframe:R,transitionIframe:V,licenseButtonGroup:G,throttledRenderPreview:m,lastUnsavedContent:j,unsavedContent:C,updateSectionHeight:A,renderUnsavedContent:b,renderMaybeUnsavedContent:T,renderPreview:H,handleMessage:$,t:Q,handleRegistration:Re}}});var _e=function(){var r=this,e=r._self._c,t=r._self._setupProxy;return e("k-section",{attrs:{label:t.label}},[e("k-button-group",{attrs:{slot:"options"},slot:"options"},[t.license&&t.license!=="active"?e("k-button-group",{ref:"licenseButtonGroup",attrs:{layout:"collapsed"}},[e("k-button",{attrs:{theme:"love",variant:"filled",size:"xs",link:"https://kirby.tools/live-preview#pricing",target:"_blank",text:t.panel.t("johannschopplich.preview.license.buy")}}),e("k-button",{attrs:{theme:"love",variant:"filled",size:"xs",icon:"key",text:t.panel.t("johannschopplich.preview.license.activate")},on:{click:function(a){return t.handleRegistration()}}})],1):r._e(),e("k-button",{attrs:{variant:"filled",size:"xs",icon:"live-preview-restart"},on:{click:function(a){return t.renderUnsavedContent()}}})],1),e("div",{ref:"container",staticClass:"klp-grid klp-min-h-[55dvh] klp-rounded-[var(--input-rounded)]",class:[t.isRendering&&"klp-pointer-events-none",t.transitionBlobUrl&&!t.hasError&&"k-shadow-md",(!t.transitionBlobUrl||t.hasError)&&"klp-border klp-border-dashed klp-border-[var(--color-gray-400)]"],style:{aspectRatio:t.aspectRatio,height:t.aspectRatio?"auto":`calc(100dvh - ${t.containerRect.top??0}px - var(--spacing-3))`,maxWidth:"100%"},attrs:{"data-theme":"passive"}},[t.transitionBlobUrl?e("iframe",{ref:"transitionIframe",staticClass:"klp-h-full klp-w-full klp-rounded-[var(--input-rounded)] klp-bg-white",class:[t.hasError&&"klp-pointer-events-none klp-opacity-0"],style:{gridArea:"1 / 1 / 1 / 1"},attrs:{src:t.transitionBlobUrl}}):r._e(),t.blobUrl?e("iframe",{ref:"iframe",staticClass:"klp-h-full klp-w-full klp-rounded-[var(--input-rounded)] klp-bg-white",class:[(t.showTransitionIframe||t.hasError)&&"klp-pointer-events-none klp-opacity-0"],style:{gridArea:"1 / 1 / 1 / 1"},attrs:{src:t.blobUrl}}):r._e(),t.hasError?e("div",{staticClass:"klp-flex klp-items-center klp-justify-center",style:{gridArea:"1 / 1 / 1 / 1"}},[e("k-button",{attrs:{variant:"filled",theme:"notice",icon:"alert",text:t.panel.t("johannschopplich.preview.error.render")},on:{click:function(a){return t.renderUnsavedContent({persistScrollPosition:!1})}}})],1):r._e()]),t.help?e("k-text",{staticClass:"k-help klp-mt-2",attrs:{html:t.help}}):r._e()],1)},Ee=[],Ce=ke(Le,_e,Ee,!1,null,"ce1e08f5");const xe=Ce.exports;window.panel.plugin("johannschopplich/live-preview",{sections:{preview:xe},icons:{"live-preview-restart":'<path d="M18.537 19.567A9.961 9.961 0 0 1 12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10c0 2.136-.67 4.116-1.81 5.74L17 12h3a8 8 0 1 0-2.46 5.772z" />'}})})();
