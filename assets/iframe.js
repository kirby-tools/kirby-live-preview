document.addEventListener("click",e=>{let t=e.target.closest("a");if(t?.href){let n=r(t.href);if(!n||n.pathname===location.pathname||t.dataset.previewIgnore!==void 0)return;e.preventDefault(),window.parent.postMessage({type:"link",href:t.href},"*")}});document.addEventListener("keydown",e=>{e.key==="s"&&(e.metaKey||e.ctrlKey)&&(e.preventDefault(),window.parent.postMessage({type:"save"},"*"))});function r(e){try{return new URL(e)}catch{return}}
