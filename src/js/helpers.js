import { async } from "regenerator-runtime";
import { TIMEOUT_SEC } from "./config";

// Contains all the reusable components

export const AJAX = async function(url,uploadData = undefined){
  try {
    const fetchPro = uploadData ? fetch(url,{
      method : 'POST',
      headers : {
        'Content-Type' : 'application/json' 
      },
      body : JSON.stringify(uploadData)
    }) : fetch(url)
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw new Error(err);
  }  
}

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};
