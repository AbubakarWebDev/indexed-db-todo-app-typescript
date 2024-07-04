var R=Object.defineProperty;var q=(s,e,t)=>e in s?R(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var d=(s,e,t)=>q(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(o){if(o.ep)return;o.ep=!0;const n=t(o);fetch(o.href,n)}})();const v="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";let A=(s=21)=>{let e="",t=crypto.getRandomValues(new Uint8Array(s));for(;s--;)e+=v[t[s]&63];return e};class x{constructor(e,t,r,o){d(this,"database");d(this,"request");d(this,"isVersionChanged");d(this,"createRecord",(e,t,r)=>new Promise((o,n)=>{var c;const a=(c=this.database)==null?void 0:c.transaction(e,"readwrite");a&&(a.objectStore(e).add(t,r),a.onerror=()=>{var u;n(((u=a.error)==null?void 0:u.message)??"Something went wrong while happening the write operation")},a.oncomplete=()=>{o("success")})}));d(this,"updateRecord",(e,t,r)=>new Promise((o,n)=>{var c;const a=(c=this.database)==null?void 0:c.transaction(e,"readwrite");a&&(a.objectStore(e).put(t,r),a.onerror=()=>{var u;n(((u=a.error)==null?void 0:u.message)??"Something went wrong while happening the update operation")},a.oncomplete=()=>{o("success")})}));d(this,"getRecords",(e,t)=>new Promise((r,o)=>{var i;const n=(i=this.database)==null?void 0:i.transaction(e);if(!n){o("Something went wrong with transaction");return}const a=n.objectStore(e);let c;t?c=a.get(t):c=a.getAll(),c.onerror=()=>{var u;o(((u=c.error)==null?void 0:u.message)||"Something went wrong while happening the read operation")},c.onsuccess=()=>{r(Array.isArray(c.result)?c.result:[c.result])}}));d(this,"deleteRecord",(e,t)=>new Promise((r,o)=>{var a;const n=(a=this.database)==null?void 0:a.transaction(e,"readwrite");n&&(n.objectStore(e).delete(t),n.onerror=()=>{var i;o(((i=n.error)==null?void 0:i.message)??"Something went wrong while happening the delete operation")},n.oncomplete=()=>{r("success")})}));d(this,"onUpgradeneeded",(e,t)=>{this.database=this.request.result,this.createObjectStore(e).then(()=>{t==null||t(),this.isVersionChanged=!0}).catch(r=>alert(r))});d(this,"onRequestSuccess",e=>{this.database=this.request.result,this.isVersionChanged||e==null||e(),this.isVersionChanged=!1});d(this,"onRequestError",e=>{var t;console.log(`IndexedDB error: ${(t=this.request)==null?void 0:t.error}`,e)});this.request=indexedDB.open(e,t),this.request.addEventListener("onerror",this.onRequestError),this.request.addEventListener("success",()=>this.onRequestSuccess(o)),this.request.addEventListener("upgradeneeded",()=>this.onUpgradeneeded(r,o))}createObjectStore({objectStoreName:e,objectStoreOptions:t,objectStoreIndexes:r}){return new Promise((o,n)=>{var a,c;try{if((a=this.database)!=null&&a.objectStoreNames.contains(e)){n("The passed objectStoreName is already exist on the database");return}const i=(c=this.database)==null?void 0:c.createObjectStore(e,t);if(!i){n("Something went wrong. Please try again later");return}r&&r.forEach(({name:u,keyPath:S,options:E})=>{i.createIndex(u,S,E)}),i.transaction.oncomplete=()=>o("success")}catch(i){n(i instanceof DOMException&&(i==null?void 0:i.message)||"Something went wrong. Please try again later")}})}}const p=document.querySelector("#todo-id"),h=document.querySelector("#todo-name"),l=document.querySelector("#todo-image"),g=document.querySelector("#submit-btn"),L=()=>{const s=h==null?void 0:h.value,e=(l==null?void 0:l.files)&&l.files[0];if(!s||!e){alert("Please enter valid data");return}return{todoName:s,todoImage:e,todoId:(p==null?void 0:p.value)??""}},O=(s,e,t)=>{if(p&&h&&l){h.value=e,p.value=s;const r=new DataTransfer;r.items.add(t),l.files=r.files}},P=()=>{p&&h&&l&&(p.value="",h.value="",l.value="")},w=async s=>{try{await s()}catch(e){alert("Something went wrong. please check browser console for the error"),console.log(e)}};function y(s,e,t){document.addEventListener(s,function(r){const o=r.target.closest(e);o&&t(r,o)})}g==null||g.addEventListener("click",async function(){const s=L();if(!s)return;const{todoId:e,todoName:t,todoImage:r}=s,o=this.dataset.action,n=o==="update"?m.updateRecord:m.createRecord;await w(async()=>{await n(f,{id:o==="update"?e:A(),name:t,image:r}),alert(`Record successfully ${o==="update"?"Updated":"Added"}`),P(),await b()})});y("click","#update-btn",async function(s,e){const t=e.dataset.id;await w(async()=>{const r=await m.getRecords(f,t);O(r[0].id,r[0].name,r[0].image),g&&(g.dataset.action="update")})});y("click","#delete-btn",async function(s,e){const t=e.dataset.id;t?await w(async()=>{await m.deleteRecord(f,t),await b()}):alert("todo id is not found")});async function b(){await w(async()=>{const s=await m.getRecords(f),e=document.getElementById("table-body");let t="";s.forEach((r,o)=>{const n=URL.createObjectURL(r.image);t+=`
        <tr class="border-b dark:border-neutral-500">
          <td class="whitespace-nowrap px-6 py-4 font-medium">${o+1}</td>
  
          <td class="whitespace-nowrap px-6 py-4">${r.name}</td>
  
          <td class="whitespace-nowrap px-6 py-4">
            <img src="${n}" alt="Todo Attachment" width="100" height="100" />
          </td>
  
          <td class="whitespace-nowrap px-6 py-4">
            <button
              type="button"
              id="update-btn"
              data-id="${r.id}"
              class="bg-blue-600 text-neutral-50 px-4 py-2 rounded-lg"
            >
              Update
            </button>
          </td>
  
          <td class="whitespace-nowrap px-6 py-4">
            <button
              type="button"
              id="delete-btn"
              data-id="${r.id}"
              class="bg-red-600 text-neutral-50 px-4 py-2 rounded-lg"
            >
              Delete
            </button>
          </td>
        </tr>
      `}),e&&(e.innerHTML=t)})}window.indexedDB||alert("Indexed DB is not supported");const j="main",D=1,f="todos",T={objectStoreName:f,objectStoreIndexes:[{name:"nameIndex",keyPath:"name",options:{unique:!1}}],objectStoreOptions:{keyPath:"id"}},B=async()=>{await b()},m=new x(j,D,T,B);
