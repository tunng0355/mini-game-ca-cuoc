class AjaxForm {
  constructor(formSelector) {
      this.form = $(formSelector);
      this.form.submit(this.handleSubmit.bind(this));
  }

  handleSubmit(event) {
      event.preventDefault();
      const url = this.form.attr('action');
      const method = this.form.attr('method');
      const data = this.form.serialize();
      const json = this.convertQueryStringToJson(data);
      const jsonData = JSON.stringify(json); // Chuyển đổi đối tượng JSON thành chuỗi JSON
      this.sendRequest(url, method, jsonData);
  }

  convertQueryStringToJson(queryString) {
      const json = {};
      queryString.split('&').forEach((pair) => {
          const [key, value] = pair.split('=');
          json[key] = decodeURIComponent(value.replace(/\+/g, ' '));
      });
      return json;
  }

  sendRequest(url, method, data) {
      $.ajax({
          url: url,
          data: data,
          type: method,
          contentType: 'application/json', // Đặt loại nội dung là JSON
          dataType: 'json',
          statusCode: {
              500: () => {
                  this.notify(500, 'Lỗi máy chủ! Mã trạng thái 500');
              },
          },
          success: (data, textStatus, hxr) => {
              if (!data) {
                  this.notify('error', 'Không thể nhận dữ liệu từ API này');
              } else {
                  if (!data.href) {
                      this.notify(hxr.status, data.message);
                  } else {
                      if (hxr.status == 200) {
                          setTimeout(() => {
                              window.location.href = data.href;
                          }, 700);
                      }
                      this.notify(hxr.status, data.message);
                  }
              }
          },
          error: (request) => {
              const obj = JSON.parse(request.responseText);
              if (!obj) {
                  this.notify('error', 'Không thể nhận dữ liệu từ API này');
              } else {
                  if (!obj.href) {
                      this.notify(request.status, obj.message);
                  } else {
                      if (request.status == 200) {
                          setTimeout(() => {
                              window.location.href = obj.href;
                          }, 700);
                      }
                      this.notify(request.status, obj.message);
                  }
              }
          },
      });
  }

  notify(code, message) {
      switch (code) {
          case 400:
              var status = 'error';
              break;
          case 200:
              var status = 'success';
              break;
          default:
              var status = 'error';
      }
      Swal.fire({
          icon: status,
          text: message,
      });
      console.log('Code:', code, 'Message:', message);
  }
}
