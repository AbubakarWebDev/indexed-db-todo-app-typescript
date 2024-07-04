var y=Object.defineProperty;var E=(n,e,t)=>e in n?y(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var d=(n,e,t)=>E(n,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();const S="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";let x=(n=21)=>{let e="",t=crypto.getRandomValues(new Uint8Array(n));for(;n--;)e+=S[t[n]&63];return e};class R{constructor(e,t,o,r){d(this,"database");d(this,"request");d(this,"isVersionChanged");d(this,"createRecord",(e,t,o)=>new Promise((r,s)=>{var i;const a=(i=this.database)==null?void 0:i.transaction(e,"readwrite");a&&(a.objectStore(e).add(t,o),a.onerror=()=>{var l;s(((l=a.error)==null?void 0:l.message)??"Something went wrong while happening the write operation")},a.oncomplete=()=>{r("success")})}));d(this,"getRecords",e=>new Promise((t,o)=>{var i;const r=(i=this.database)==null?void 0:i.transaction(e);if(!r){o("Something went wrong with transaction");return}const a=r.objectStore(e).getAll();a.onerror=()=>{var c;o(((c=a.error)==null?void 0:c.message)||"Something went wrong while happening the read operation")},a.onsuccess=()=>{t(a.result)}}));d(this,"onUpgradeneeded",(e,t)=>{this.database=this.request.result,this.createObjectStore(e).then(()=>{t==null||t(),this.isVersionChanged=!0}).catch(o=>alert(o))});d(this,"onRequestSuccess",e=>{this.database=this.request.result,this.isVersionChanged||e==null||e(),this.isVersionChanged=!1});d(this,"onRequestError",e=>{var t;console.log(`IndexedDB error: ${(t=this.request)==null?void 0:t.error}`,e)});this.request=indexedDB.open(e,t),this.request.addEventListener("onerror",this.onRequestError),this.request.addEventListener("success",()=>this.onRequestSuccess(r)),this.request.addEventListener("upgradeneeded",()=>this.onUpgradeneeded(o,r))}createObjectStore({objectStoreName:e,objectStoreOptions:t,objectStoreIndexes:o}){return new Promise((r,s)=>{var a,i;try{if((a=this.database)!=null&&a.objectStoreNames.contains(e)){s("The passed objectStoreName is already exist on the database");return}const c=(i=this.database)==null?void 0:i.createObjectStore(e,t);if(!c){s("Something went wrong. Please try again later");return}o&&o.forEach(({name:l,keyPath:f,options:w})=>{c.createIndex(l,f,w)}),c.transaction.oncomplete=()=>r("success")}catch(c){s(c instanceof DOMException&&(c==null?void 0:c.message)||"Something went wrong. Please try again later")}})}}var h;(h=document.getElementById("submit-btn"))==null||h.addEventListener("click",async()=>{const n=document.getElementById("todo-name"),e=document.getElementById("todo-image"),t=n.value,o=e.files&&e.files[0];if(!t||!o){alert("Please enter valid data");return}try{await b.createRecord(u,{id:x(),name:t,image:o}),alert("Record successfully added"),n.value="",e.value="",await m()}catch(r){alert("Something went wrong. please check browser console for the error"),console.log(r)}});var p;(p=document.getElementById("update-btn"))==null||p.addEventListener("click",()=>{});var g;(g=document.getElementById("delete-btn"))==null||g.addEventListener("click",()=>{});async function m(){try{const n=await b.getRecords(u),e=document.getElementById("table-body");let t="";n.forEach((o,r)=>{const s=URL.createObjectURL(o.image);t+=`
        <tr class="border-b dark:border-neutral-500">
          <td class="whitespace-nowrap px-6 py-4 font-medium">${r+1}</td>
  
          <td class="whitespace-nowrap px-6 py-4">${o.name}</td>
  
          <td class="whitespace-nowrap px-6 py-4">
            <img src="${s}" alt="Todo Attachment" width="100" height="100" />
          </td>
  
          <td class="whitespace-nowrap px-6 py-4">
            <button
              type="button"
              id="update-btn"
              class="bg-blue-600 text-neutral-50 px-4 py-2 rounded-lg"
            >
              Update
            </button>
          </td>
  
          <td class="whitespace-nowrap px-6 py-4">
            <button
              type="button"
              id="delete-btn"
              class="bg-red-600 text-neutral-50 px-4 py-2 rounded-lg"
            >
              Delete
            </button>
          </td>
        </tr>
      `,e&&(e.innerHTML=t)})}catch(n){alert("Something went wrong. please check browser console for the error"),console.log(n)}}window.indexedDB||alert("Indexed DB is not supported");const q="main",B=1,u="todos",L={objectStoreName:u,objectStoreIndexes:[{name:"nameIndex",keyPath:"name",options:{unique:!1}}],objectStoreOptions:{keyPath:"id"}},A=()=>{m()},b=new R(q,B,L,A);
