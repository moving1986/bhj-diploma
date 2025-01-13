/**
 * Основная функция для совершения запросов
 * на сервер.
 * */
 const createRequest = (options = {}) => {
  const xhr = new XMLHttpRequest();
  xhr.responseType = "json";

  let url = options.url;
  let requestData;

  if (options.method === "GET") {
    let queryParams = [];
    for (let key in options.data) {
      queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(options.data[key])}`);
    }
    if (queryParams.length > 0) {
      url += "?" + queryParams.join("&");
    }
  } else {
    requestData = new FormData();
    Object.entries(options.data).forEach(([key, value]) => {
      requestData.append(key, value);
    });
  }

  xhr.open(options.method, url);
  
  xhr.send(requestData || null);
  
  xhr.addEventListener("load", () => {
    options.callback(null, xhr.response);
  });
};
