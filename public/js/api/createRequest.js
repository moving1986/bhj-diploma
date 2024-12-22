/**
 * Основная функция для совершения запросов
 * на сервер.
 * */
const createRequest = (options = {}) => {
  const xhr = new XMLHttpRequest();
  xhr.responseType = "json";

  if (options.method === "GET") {
    let way = options.url + "?";
    for (let key in options.data) {
      way += `${key}=${options.data[key]}&`;
    }
    way = way.slice(0, -1);

    xhr.open("GET", way);
    xhr.send();
  } else {
    const formData = new FormData();
    Object.entries(options.data).map(([key, value]) =>
      formData.append(key, value)
    );

    xhr.open(options.method, options.url);
    xhr.send(formData);
  }
  xhr.addEventListener("readystatechange", () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      options.callback(null, xhr.response);
    }
  });
};
