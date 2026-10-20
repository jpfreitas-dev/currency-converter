const API_BASE_URL = "https://api.frankfurter.dev/v2/rate"
const currencySymbols = {
  USD: "US$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  CHF: "CHF",
  CAD: "CA$",
  AUD: "A$",
  NZD: "NZ$",
  HKD: "HK$",
  SGD: "S$",
  INR: "₹",
  MXN: "MX$",
  ZAR: "R",
  ARS: "AR$",
}

const form = document.querySelector("form")
const amount = document.getElementById("amount")
const currency = document.getElementById("currency")
const footer = document.querySelector("main footer")
const description = document.getElementById("description")
const result = document.getElementById("result")
const submitButton = form.querySelector("button")
const currencyPicker = document.getElementById("currency-picker")
const currencyTrigger = document.getElementById("currency-trigger")
const currencyLabel = document.getElementById("currency-label")
const currencyOptions = document.getElementById("currency-options")
let selectedCurrency = ""

amount.addEventListener("focus", () => {
  amount.select()
})

amount.addEventListener("input", () => {
  const digits = amount.value.replace(/\D/g, "")
  amount.value = formatInputAmount(digits)
})

currencyTrigger.addEventListener("click", () => {
  const isOpen = currencyTrigger.getAttribute("aria-expanded") === "true"
  setCurrencyOptionsOpen(!isOpen)
})

currencyOptions.addEventListener("click", (event) => {
  const option = event.target.closest(".currency-option")

  if (!option) return

  selectedCurrency = option.dataset.value
  currency.value = selectedCurrency
  currencyLabel.textContent = `${selectedCurrency} · ${option.querySelector("span").textContent}`
  currencyOptions.querySelectorAll(".currency-option").forEach((item) => {
    item.setAttribute("aria-selected", item === option)
  })
  setCurrencyOptionsOpen(false)
})

document.addEventListener("click", (event) => {
  if (!currencyPicker.contains(event.target)) setCurrencyOptionsOpen(false)
})

form.onsubmit = async (event) => {
  event.preventDefault()

  const value = parseInputAmount(amount.value)

  if (!value || value <= 0) {
    alert("Por favor, informe um valor maior que zero para converter.")
    return
  }

  if (!selectedCurrency) {
    alert("Selecione uma moeda para converter.")
    return
  }

  await convertCurrency(value, selectedCurrency, currencySymbols[selectedCurrency])
}

async function convertCurrency(amount, currencyCode, symbol) {
  try {
    setLoading(true)
    footer.classList.add("show-result")
    description.textContent = "Buscando cotação atual..."
    result.textContent = "..."

    const response = await fetch(
      `${API_BASE_URL}/${currencyCode}/BRL`
    )

    if (!response.ok) {
      throw new Error("Não foi possível obter a cotação.")
    }

    const data = await response.json()
    const rateDate = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "UTC",
    }).format(new Date(`${data.date}T00:00:00Z`))

    description.textContent = `${symbol} 1 = ${formatCurrencyBRL(data.rate)} · Referência de ${rateDate}`
    result.textContent = formatCurrencyBRL(amount * data.rate)

  } catch (error) {
    console.log(error)
    alert("Não foi possível converter. Tente novamente mais tarde.")
  } finally {
    setLoading(false)
  }
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading
  submitButton.textContent = isLoading
    ? "Buscando cotação..."
    : "Converter em reais"
}

function setCurrencyOptionsOpen(isOpen) {
  currencyTrigger.setAttribute("aria-expanded", isOpen)
  currencyOptions.hidden = !isOpen
}

function formatInputAmount(digits) {
  const cents = Number(digits || 0)

  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function parseInputAmount(value) {
  const digits = value.replace(/\D/g, "")
  return Number(digits || 0) / 100
}

function formatCurrencyBRL(value){
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}
