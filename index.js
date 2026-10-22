
"use strict";

/* =========================================
   NÚCLEO DE BELEZA BARROS
   Interações e agendamento pelo WhatsApp
========================================= */

const $ = (selector, context = document) =>
  context.querySelector(selector);

const $$ = (selector, context = document) =>
  [...context.querySelectorAll(selector)];

const WHATSAPP_NUMBER = "5511995539568";
const INSTAGRAM_URL = "https://www.instagram.com/nucleodebeleza_barros/";

/* Atualiza o ano automaticamente */
const yearElement = $("#currentYear");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* =========================================
   CATEGORIAS DO SALÃO
   Feedback é um destaque do Instagram,
   não uma opção de serviço para agendar.
========================================= */

const services = [
  {
    highlight: "Hair",
    name: "Cabelos",
    icon: "✂️",
    description:
      "Cuidados para os cabelos. Conte à equipe o resultado que você procura e confirme quais procedimentos estão disponíveis.",
    bookable: true
  },
  {
    highlight: "Micro",
    name: "Micropigmentação",
    icon: "✧",
    description:
      "O perfil apresenta um destaque de Micro. Consulte a equipe para confirmar as técnicas, as regiões atendidas e a disponibilidade.",
    bookable: true
  },
  {
    highlight: "Feedback",
    name: "Feedbacks",
    icon: "💬",
    description:
      "Conheça as experiências e os comentários compartilhados pelo salão em seu Instagram.",
    bookable: false
  },
  {
    highlight: "Alongamento",
    name: "Alongamento de unhas",
    icon: "💅",
    description:
      "Consulte a equipe sobre as opções de alongamento, os formatos disponíveis, a manutenção e os valores.",
    bookable: true
  },
  {
    highlight: "Micro Labial",
    name: "Micropigmentação labial",
    icon: "💋",
    description:
      "Consulte a profissional sobre o procedimento, as orientações de cuidados e a disponibilidade de horários.",
    bookable: true
  },
  {
    highlight: "Nails",
    name: "Unhas",
    icon: "✦",
    description:
      "Conheça as opções de cuidados para unhas. Consulte os serviços disponíveis, os valores e os horários.",
    bookable: true
  },
  {
    highlight: "Estética",
    name: "Estética",
    icon: "🌿",
    description:
      "O perfil informa atendimento de estética. Pergunte quais procedimentos estão disponíveis antes de agendar.",
    bookable: true
  },
  {
    highlight: "Bronze",
    name: "Bronze",
    icon: "☀️",
    description:
      "Consulte a equipe sobre a modalidade de bronze oferecida, as orientações e a disponibilidade.",
    bookable: true
  }
];

/* =========================================
   DESTAQUES INTERATIVOS
========================================= */

const storiesContainer = $("#serviceStories");
const servicePanel = $("#servicePanel");

function renderStories() {
  if (!storiesContainer || !servicePanel) return;

  storiesContainer.innerHTML = services
    .map((service, index) => {
      return `
        <button
          class="story-button"
          type="button"
          data-service-index="${index}"
          aria-pressed="${index === 0 ? "true" : "false"}"
          aria-label="Ver categoria ${service.highlight}"
        >
          <span class="story-circle" aria-hidden="true">
            ${service.icon}
          </span>
          <span>${service.highlight}</span>
        </button>
      `;
    })
    .join("");

  showService(0);
}

function showService(index) {
  const service = services[index];

  if (!service || !servicePanel || !storiesContainer) return;

  $$(".story-button", storiesContainer).forEach((button, buttonIndex) => {
    button.setAttribute(
      "aria-pressed",
      String(buttonIndex === index)
    );
  });

  const actionButton = service.bookable
    ? `
      <button
        class="btn"
        type="button"
        id="selectServiceButton"
        data-service-name="${service.name}"
      >
        Consultar e agendar <span aria-hidden="true">↗</span>
      </button>
    `
    : `
      <a
        class="btn"
        href="${INSTAGRAM_URL}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ver no Instagram <span aria-hidden="true">↗</span>
      </a>
    `;

  servicePanel.classList.remove("is-changing");

  servicePanel.innerHTML = `
    <div class="service-illustration" aria-hidden="true">
      ${service.icon}
    </div>

    <div class="service-copy">
      <span class="eyebrow">
        <span class="eyebrow-line"></span>
        ${service.highlight}
      </span>

      <h3>${service.name}</h3>
      <p>${service.description}</p>
      ${actionButton}
    </div>
  `;

  /* Reinicia a animação visual do painel */
  void servicePanel.offsetWidth;
  servicePanel.classList.add("is-changing");

  const selectButton = $("#selectServiceButton", servicePanel);

  if (selectButton) {
    selectButton.addEventListener("click", () => {
      selectServiceForBooking(service.name);
    });
  }
}

if (storiesContainer) {
  storiesContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-service-index]");

    if (!button) return;

    const index = Number(button.dataset.serviceIndex);

    if (Number.isInteger(index)) {
      showService(index);
    }
  });
}

renderStories();

/* =========================================
   CAMPOS DO AGENDAMENTO
========================================= */

const serviceChoices = $("#serviceChoices");
const periodChoices = $("#periodChoices");
const bookingDate = $("#bookingDate");
const customerName = $("#customerName");
const customerNotes = $("#customerNotes");
const formError = $("#formError");
const sendBookingButton = $("#sendBooking");

/* Só serviços agendáveis aparecem no formulário */
const bookableServices = services.filter(
  (service) => service.bookable
);

if (serviceChoices) {
  serviceChoices.innerHTML = bookableServices
    .map((service, index) => {
      const id = `service-option-${index}`;

      return `
        <label class="chip" for="${id}">
          <input
            type="checkbox"
            id="${id}"
            name="services"
            value="${service.name}"
          >
          <span>${service.name}</span>
        </label>
      `;
    })
    .join("");
}

/* Períodos são preferências, não horários confirmados */
const periods = ["Manhã", "Tarde", "Noite"];

if (periodChoices) {
  periodChoices.innerHTML = periods
    .map((period, index) => {
      const id = `period-option-${index}`;

      return `
        <label class="chip" for="${id}">
          <input
            type="radio"
            id="${id}"
            name="preferredPeriod"
            value="${period}"
            ${index === 1 ? "checked" : ""}
          >
          <span>${period}</span>
        </label>
      `;
    })
    .join("");
}

/* Define a data mínima como hoje, usando a data local */
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

if (bookingDate) {
  bookingDate.min = getLocalDateString();
}

/* Seleciona o serviço clicado no painel */
function selectServiceForBooking(serviceName) {
  if (!serviceChoices || !bookingDate) return;

  const matchingInput = $$(
    'input[name="services"]',
    serviceChoices
  ).find((input) => input.value === serviceName);

  if (matchingInput) {
    matchingInput.checked = true;
  }

  const bookingSection = $("#agendar");

  if (bookingSection) {
    bookingSection.scrollIntoView({
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches ? "auto" : "smooth",
      block: "start"
    });
  }

  if (matchingInput) {
    matchingInput.focus({ preventScroll: true });
  }
}

/* Mostra erros sem deixar mensagens antigas */
function showError(message) {
  if (!formError) return;

  formError.replaceChildren();
  formError.textContent = message;
}

function clearError() {
  if (formError) {
    formError.replaceChildren();
  }
}

/* Formata data para DD/MM/AAAA */
function formatDate(dateString) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");

  return `${day}/${month}/${year}`;
}

/* =========================================
   ENVIO DO PEDIDO PELO WHATSAPP
========================================= */

function submitBookingRequest() {
  clearError();

  if (
    !serviceChoices ||
    !customerName ||
    !customerNotes ||
    !bookingDate ||
    !sendBookingButton
  ) {
    showError(
      "Não foi possível carregar todos os campos. Atualize a página e tente novamente."
    );
    return;
  }

  const selectedServices = $$(
    'input[name="services"]:checked',
    serviceChoices
  ).map((input) => input.value);

  const name = customerName.value.trim();
  const notes = customerNotes.value.trim();
  const selectedPeriod = $(
    'input[name="preferredPeriod"]:checked'
  );

  /* Validação dos serviços */
  if (selectedServices.length === 0) {
    showError("Selecione pelo menos um serviço.");
    serviceChoices.querySelector("input")?.focus();
    return;
  }

  /* Validação do nome */
  if (name.length < 2) {
    showError("Digite seu nome para continuarmos.");
    customerName.focus();
    return;
  }

  /* Validação da data */
  const selectedDate = bookingDate.value;
  const today = getLocalDateString();

  if (selectedDate && selectedDate < today) {
    showError("Escolha a data de hoje ou uma data futura.");
    bookingDate.focus();
    return;
  }

  if (!selectedPeriod) {
    showError("Selecione o período de sua preferência.");
    return;
  }

  /* Monta a mensagem para o cliente revisar no WhatsApp */
  const messageLines = [
    "Olá! Vim pelo site do Núcleo de Beleza Barros e gostaria de solicitar um agendamento.",
    "",
    `Nome: ${name}`,
    `Serviço(s): ${selectedServices.join(", ")}`,
    selectedDate
      ? `Data de preferência: ${formatDate(selectedDate)}`
      : "Data de preferência: a combinar",
    `Período preferido: ${selectedPeriod.value}`,
    notes ? `Observações: ${notes}` : "",
    "",
    "Poderiam confirmar a disponibilidade e os horários, por favor?"
  ].filter((line) => line !== "");

  const message = messageLines.join("\n");

  const whatsappURL =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  /*
    Abre o WhatsApp em outra aba.
    Se o navegador bloquear a abertura, oferece um link alternativo.
  */
  const newWindow = window.open(
    whatsappURL,
    "_blank",
    "noopener,noreferrer"
  );

  if (!newWindow) {
    showError(
      "O navegador bloqueou a abertura automática. Use o link abaixo para continuar."
    );

    const fallbackLink = document.createElement("a");

    fallbackLink.href = whatsappURL;
    fallbackLink.target = "_blank";
    fallbackLink.rel = "noopener noreferrer";
    fallbackLink.className = "fallback-link";
    fallbackLink.textContent = "Abrir o WhatsApp";

    formError.appendChild(document.createTextNode(" "));
    formError.appendChild(fallbackLink);
  }
}

if (sendBookingButton) {
  sendBookingButton.addEventListener(
    "click",
    submitBookingRequest
  );
}

/* Limpa a mensagem de erro quando a pessoa corrige os campos */
[
  serviceChoices,
  periodChoices,
  customerName,
  customerNotes,
  bookingDate
].forEach((element) => {
  if (!element) return;

  element.addEventListener("change", clearError);
  element.addEventListener("input", clearError);
});

/* =========================================
   MENU PARA CELULAR
========================================= */

const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");

function closeMobileMenu() {
  if (!menuToggle || !mainNav) return;

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  mainNav.classList.remove("nav-open");
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen =
      menuToggle.getAttribute("aria-expanded") === "true";

    const shouldOpen = !isOpen;

    menuToggle.setAttribute(
      "aria-expanded",
      String(shouldOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      shouldOpen ? "Fechar menu" : "Abrir menu"
    );

    mainNav.classList.toggle("nav-open", shouldOpen);
  });

  /* Fecha o menu depois de clicar em um link */
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  /* Fecha o menu com Escape */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
      menuToggle.focus();
    }
  });

  /* Fecha o menu caso a tela volte ao tamanho de computador */
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeMobileMenu();
    }
  });
}
