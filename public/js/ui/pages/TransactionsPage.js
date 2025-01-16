/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor(element) {
    if (!element) {
      throw new Error("не передан element");
    } 
    this.element = element;
    this.registerEvents();
  }

  lastOptions = "";
  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    if (this.lastOptions) {
      this.render(this.lastOptions);
    }
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
    const removAccount = document.querySelector(".remove-account");
    /* const transactionRemove = document.querySelector('.transaction__remove');*/
    const content = document.querySelector(".content");
    if (removAccount) {
      removAccount.addEventListener("click", () => {
        this.removeAccount();
      });
    }
    if (content) {
      content.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("transaction__remove")) {
          this.removeTransaction(target.getAttribute("data-id"));
        }
      });
    }
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets() и App.updateForms(),
   * либо обновляйте только виджет со счетами и формы создания дохода и расхода
   * для обновления приложения
   * */
  removeAccount() {
    if (confirm("Вы хотите удалить счёт?")) {
      let idAcc = document.querySelector(".active").getAttribute("data-id");
      Account.remove({ id: idAcc }, (err, response) => {
        if (response.success) {
          this.clear();
          App.updateWidgets();
          App.updateForms();
        }
      });
    }
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
   removeTransaction(id) {
    if (confirm("Вы хотите удалить транзакцию?")) {
      Transaction.remove({ id: id }, (err, response) => {
        if (err) {
          console.error("Ошибка при удалении транзакции:", err);
          alert("Не удалось удалить транзакцию. Пожалуйста, попробуйте еще раз.");
          return;
        }
        if (response.success) {
          this.update();
          App.updateWidgets();
          App.updateForms();
        } else {
          alert("Не удалось удалить транзакцию. Проверьте данные и попробуйте снова.");
        }
      });
    }
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
   render(options) {
    if (options) {
        this.lastOptions = options;

        Account.get(options.account_id, (err, response) => {
            if (response.success) {
                this.clear();
                this.renderTitle(response.data.name);
            }
        });

        Transaction.list({ account_id: options.account_id }, (err, response) => {
            if (response.success) {
                this.renderTransactions(response.data);
            }
        });
    }
}

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    this.renderTransactions([]);
    this.renderTitle("Название счёта");
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name) {
    document.querySelector(".content-title").textContent = name;
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date) {
    let dateOb = new Date(date);

    return dateOb.toLocaleString("default", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timezone: "UTC",
      hour: "numeric",
      minute: "numeric",
    });
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item) {
    return `<div class="transaction transaction_${item.type} row">
                <div class="col-md-7 transaction__details">
                  <div class="transaction__icon">
                      <span class="fa fa-money fa-2x"></span>
                  </div>
                  <div class="transaction__info">
                      <h4 class="transaction__title">${item.name}</h4>
                      <!-- дата -->
                      <div class="transaction__date">${this.formatDate(
                        item.created_at
                      )}</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="transaction__summ">
                  <!--  сумма -->
                      ${item.sum} <span class="currency">₽</span>
                  </div>
                </div>
                <div class="col-md-2 transaction__controls">
                    <!-- в data-id нужно поместить id -->
                    <button class="btn btn-danger transaction__remove" data-id="${
                      item.id
                    }">
                        <i class="fa fa-trash"></i>  
                    </button>
                </div>
              </div>`;
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data) {
    const content = document.querySelector(".content");
    if (data.length == 0) {
      content.innerHTML = "";
      return;
    } 
    content.innerHTML = data.reduce((acc, item) => acc + this.getTransactionHTML(item), '');
  }
}
