const isPreviewMode = false
const qualtrixBaseUrlPreviewMode = 'https://wiwigoettingen.eu.qualtrics.com/jfe/preview/'
const qualtrixBaseUrl = 'https://wiwigoettingen.eu.qualtrics.com/jfe/form/'

const option1Selector = "option1"
const option2Selector = "option2"

const choiceScenarioQueryParam = 'choiceScenario';
const consentNonceQueryParam = 'consentNonce';
const consentSessionIdQueryParam = 'consentSessionID';
const surveyIdQueryParam = 'surveyID';

const locale = 'de';
const translations = {
    'en': {
        'veggie-dish-name': 'Veggie sausage and onion skewers',
        'pork-dish-name': 'Pork sausage and onion skewers',
        'served-with': 'served with Greek orzo-pasta salad and tomato sauce.',
        'veggie': 'Plant-based sausage',
        'meat': 'Pork sausage',
        'hey-there': "They there 👋",
        'select-sausage': "Select sausage",
        'rather-have': "Rather have a ",
        'preselected-taste': "We have pre-selected the tastiest protein option for you. Enjoy!",
        'preselected-sust': "We have pre-selected the most environmentally-friendly protein option for you. Enjoy!",
        'select': "Select",
        'selected': "Selected",
        'save-selection': "Save selection",
        'cancel': "Cancel",
    },
    "de": {
        'veggie-dish-name': 'Spieße mit Zwiebeln und Bratwurst auf Pflanzenbasis',
        'pork-dish-name': 'Spieße mit Zwiebeln und Bratwurst vom Schwein',
        'served-with': 'Dazu griechischer Orzopastasalat und Tomatensoße.',
        'veggie': 'Bratwurst auf Erbsenbasis',
        'meat': 'Bratwurst vom Schwein',
        'hey-there': "Hallo 👋",
        'select-sausage': "Auswahl",
        'rather-have': "Lieber eine ",
        'preselected-taste': "Wir haben die leckerste Bratwurst für dich ausgewählt. Guten Appetit!",
        'preselected-sust': "Wir haben die nachhaltigste Bratwurst für dich ausgewählt. Guten Appetit!",
        'select': "Auswählen",
        'selected': "Ausgewählt",
        'save-selection': "Bestätigen",
        'cancel': "Abbrechen",
    },
};

const ChoiceScenario = {
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
}

const idToChoiceScenario = (choiceScenarioId) => {
    switch (choiceScenarioId) {
        case "c3c1d9e0":
            return ChoiceScenario.A
        case "00a78e00":
            return ChoiceScenario.B
        case "797f316f":
            return ChoiceScenario.C
        case "332dfc59":
            return ChoiceScenario.D
        default:
            const errorMessage = "Technical issue with survey: unknown choice scenario ID [" + choiceScenarioId + "].";
            window.alert(errorMessage)
            throw errorMessage;
    }
}

const Framing = {
    Taste: 'Taste',
    Sustainability: 'Sustainability',
    None: 'None'
}

const Type = {
    Veggie: 'Veggie',
    Meat: 'Meat'
}

const itemSelection = (function () {
    let selectedItem
    let confirmedItem
    let viewedOptOut = false
    let confirmedItemChangeCount = 0

    class Item {
        constructor(id) {
            this.id = id
        }
    }

    const saveSelectedItem = () => {
        sessionStorage.setItem('selectedItem', JSON.stringify(selectedItem))
    };

    const saveConfirmedItem = () => {
        sessionStorage.setItem('confirmedItem', JSON.stringify(confirmedItem))
    };

    const saveViewedOptOut = () => {
        sessionStorage.setItem('viewedOptOut', JSON.stringify(viewedOptOut))
    };

    const saveConfirmedItemChangeCount = () => {
        sessionStorage.setItem('confirmedItemChangeCount', JSON.stringify(confirmedItemChangeCount))
    };

    const loadSelectedItem = () => {
        selectedItem = JSON.parse(sessionStorage.getItem('selectedItem'))
    };

    const loadConfirmedItem = () => {
        confirmedItem = JSON.parse(sessionStorage.getItem('confirmedItem'))
    };

    const loadViewedOptOut = () => {
        viewedOptOut = JSON.parse(sessionStorage.getItem("viewedOtpOut"))
    }

    const loadConfirmedItemChangeCount = () => {
        confirmedItemChangeCount = JSON.parse(sessionStorage.getItem("confirmedItemChangeCount"))
    }

    if (sessionStorage.getItem("selectedItem") != null) {
        loadSelectedItem()
    }

    if (sessionStorage.getItem("confirmedItem") != null) {
        loadConfirmedItem()
    }

    if (sessionStorage.getItem("viewedOtpOut") != null) {
        loadViewedOptOut()
    }

    if (sessionStorage.getItem("confirmedItemChangeCount") != null) {
        loadConfirmedItemChangeCount()
    }

    const obj = {}

    obj.selectItem = id => {
        selectedItem = new Item(id)
        saveSelectedItem()
    }

    obj.confirmItem = id => {
        obj.selectItem(id)
        confirmedItem = new Item(id)
        saveConfirmedItem()
    }

    obj.markViewedOptOut = () => {
        viewedOptOut = true
        saveViewedOptOut()
    }

    obj.incrementConfirmedItemChangeCount = () => {
        confirmedItemChangeCount++
        saveConfirmedItemChangeCount()
    }

    obj.storeChoiceScenarioProps = (props) => {
        sessionStorage.setItem('props', JSON.stringify(props))
    }

    obj.selectedItem = () => selectedItem

    obj.confirmedItem = () => confirmedItem

    obj.viewedOptOut = () => viewedOptOut

    obj.confirmedItemChangeCount = () => confirmedItemChangeCount

    obj.choiceScenarioProps = () => {
        return JSON.parse(sessionStorage.getItem('props'))
    }

    return obj
})()

$('.select-item').click(function (event) {
    event.preventDefault()
    const id = $(this).data('id')
    itemSelection.selectItem(id)
    displaySelected()
})

$('.close-modal').click(function (_) {
    // Reset to previously confirmed item
    itemSelection.confirmItem(itemSelection.confirmedItem().id)
})

$('.save-item').click(function (_) {
    if (itemSelection.selectedItem().id !== itemSelection.confirmedItem().id) {
        itemSelection.incrementConfirmedItemChangeCount()
    }
    itemSelection.confirmItem(itemSelection.selectedItem().id)
    displayConfirmed(itemSelection.choiceScenarioProps())
})

$('.open-modal').click(function (_) {
    if (!itemSelection.viewedOptOut()) {
        itemSelection.markViewedOptOut()
    }
    displaySelected()
})

function toQualtrixUrl(surveyId, confirmedType, choiceScenario, consentSessionId, viewedOptOut, choiceChangeCount) {
    return getTargetUrl()
        + surveyId
        + "?"
        + toQualtrixParam(confirmedType)
        + "&ChoiceScenario=" + choiceScenario
        + "&ConsentSessionID=" + consentSessionId
        + "&Viewed=" + viewedOptOut
        + "&Count=" + choiceChangeCount;
}

const isValidConsentNonce = () => getParameterByName(consentNonceQueryParam) === "e4c2790346bf4cbca22b961a324094ae";

$('.checkout').click(function (event) {
    event.preventDefault()
    try {
        if (!isValidConsentNonce()) {
            window.alert("Consent nonce required to submit choice.")
            return;
        }
        const currentProps = itemSelection.choiceScenarioProps();
        const choiceScenario = currentProps["choiceScenario"]
        if (choiceScenario !== ChoiceScenario.A && choiceScenario !== ChoiceScenario.B && choiceScenario !== ChoiceScenario.C && choiceScenario !== ChoiceScenario.D) {
            window.alert("Invalid choice scenario [" + choiceScenario + "]")
            return;
        }
        const confirmedType = getConfirmedType(itemSelection.confirmedItem().id, currentProps)
        const consentSessionId = getParameterByName(consentSessionIdQueryParam)
        const surveyId = currentProps["surveyId"]
        const win = window.open(
            toQualtrixUrl(
                surveyId,
                confirmedType,
                choiceScenario,
                consentSessionId,
                itemSelection.viewedOptOut(),
                itemSelection.confirmedItemChangeCount()
            ),
            '_self'
        )
        win.focus()
    } catch (e) {
        const errorMessage = "Technical issue with survey: failed to submit result"
        console.error(errorMessage, e)
        window.alert(errorMessage)
    }
})

const getConfirmedType = (id, props) => {
    return props[id].type
}

const toQualtrixParam = (type) => {
    switch (type) {
        case Type.Veggie:
            return "SelectedItem=Veggie"
        case Type.Meat:
            return "SelectedItem=Meat"
        default:
            return ""
    }
}

const getTargetUrl = () => {
    if (isPreviewMode) {
        return qualtrixBaseUrlPreviewMode
    } else {
        return qualtrixBaseUrl
    }
}

// TODO hack hack hack
const getCardId = id => 'card-' + id

const displaySelected = () => {
    const displaySelectedButton = id => {
        const buttons = document.querySelectorAll('.select-item')
        for (const button of buttons) {
            let jButton = $(button)
            if (jButton.data('id') === id) {
                jButton.html(loc("selected"))
                jButton.removeClass("btn-secondary").addClass("btn-success")
            } else {
                jButton.html(loc("select"))
                jButton.removeClass("btn-success").addClass("btn-secondary")
            }
        }
    }

    const displaySelectedCard = id => {
        const cards = document.querySelectorAll('.select-card')
        for (const card of cards) {
            let jCard = $(card)
            if (jCard.data('id') === getCardId(id)) {
                jCard.removeClass("border-light").addClass("border-success")
            } else {
                jCard.removeClass("border-success").addClass("border-light")
            }
        }
    }

    const selectedItemId = itemSelection.selectedItem().id
    displaySelectedButton(selectedItemId)
    displaySelectedCard(selectedItemId)
}

const displayConfirmed = (props) => {
    const confirmedType = getConfirmedType(itemSelection.confirmedItem().id, props)
    const card = document.querySelector('[data-id=menu-card-body]')
    const title = card.querySelector('.card-title')
    const description = card.querySelector('[data-id=menu-description-text]')
    const ratherHave = card.querySelector('[data-id=rather-have-link]')
    if (confirmedType === Type.Veggie) {
        $(title).html(loc("veggie-dish-name"))
        $(description).html(loc("veggie") + ". " + loc("served-with"))
        $(ratherHave).html(loc("meat") + "?")
    } else if (confirmedType === Type.Meat) {
        $(title).html(loc("pork-dish-name"))
        $(description).html(loc("meat") + ". " + loc("served-with"))
        $(ratherHave).html(loc("veggie") + "?")
    }
}

const loc = tag => translations[locale][tag]

const displayOptions = (props) => {
    const displayOption = (id, type) => {
        const card = document.querySelector('[data-id=' + getCardId(id) + ']')
        const label = card.querySelector('[data-id=label]')
        $(label).html(typeHtml(type))
    }

    const typeHtml = (type) => {
        if (type === Type.Veggie) {
            return loc("veggie")
        } else if (type === Type.Meat) {
            return loc("meat")
        }
    }

    const option1 = props[option1Selector]
    displayOption(option1Selector, option1.type)
    const option2 = props[option2Selector]
    displayOption(option2Selector, option2.type)
}

const displayFramingModal = (props) => {
    const displayFraming = (framingModal, framingText) => {
        const text = framingModal.querySelector('[data-id=framing-text]')
        $(text).html(framingText)
        $(framingModal).modal('show')
    }

    const option = props[option1Selector]
    const framingModal = document.querySelector('[data-id=framing-modal]')
    switch (option.framing) {
        case Framing.Taste:
            displayFraming(framingModal, loc("preselected-taste"))
            return
        case Framing.Sustainability:
            displayFraming(framingModal, loc("preselected-sust"))
            return
        default:
            return
    }
}

const veggieDefaultTasteFraming = () => {
    const props = {}
    props[option1Selector] = {
        type: Type.Veggie,
        framing: Framing.Taste
    }
    props[option2Selector] = {
        type: Type.Meat,
        framing: Framing.None
    }
    props["confirmed"] = option1Selector
    return props
}

const veggieDefaultSustainabilityFraming = () => {
    const props = {}
    props[option1Selector] = {
        type: Type.Veggie,
        framing: Framing.Sustainability
    }
    props[option2Selector] = {
        type: Type.Meat,
        framing: Framing.None
    }
    props["confirmed"] = option1Selector
    return props
}

const veggieDefaultNoFraming = () => {
    const props = {}
    props[option1Selector] = {
        type: Type.Veggie,
        framing: Framing.None
    }
    props[option2Selector] = {
        type: Type.Meat,
        framing: Framing.None
    }
    props["confirmed"] = option1Selector
    return props
}

const meatDefaultNoFraming = () => {
    const props = {}
    props[option1Selector] = {
        type: Type.Meat,
        framing: Framing.None
    }
    props[option2Selector] = {
        type: Type.Veggie,
        framing: Framing.None
    }
    props["confirmed"] = option1Selector
    return props
};

const setPropsByChoiceScenario = (choiceScenario) => {
    switch (choiceScenario) {
        case ChoiceScenario.A:
            return veggieDefaultTasteFraming()
        case ChoiceScenario.B:
            return veggieDefaultSustainabilityFraming()
        case ChoiceScenario.C:
            return veggieDefaultNoFraming()
        case ChoiceScenario.D:
            return meatDefaultNoFraming()
        default:
            const errorMessage = "Technical issue with survey: unknown choice scenario [" + choiceScenario + "].";
            window.alert(errorMessage)
            throw errorMessage;
    }
}

const withMetadata = (props) => {
    props["consentNonce"] = getParameterByName(consentNonceQueryParam)
    props["consentSessionId"] = getParameterByName(consentSessionIdQueryParam)
    props["surveyId"] = getParameterByName(surveyIdQueryParam)
    props["choiceScenario"] = choiceScenario
    return props
}

const getParameterByName = (name, url = window.location.href) => {
    name = name.replace(/[\[\]]/g, '\\$&')
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

const localize = () => {
    document
        .querySelectorAll("[data-i18n-key]")
        .forEach(localizeElement);
}

const localizeElement = element => {
    const key = element.getAttribute("data-i18n-key");
    element.innerText = translations[locale][key];
};

const canonicalize = (choiceScenarioParam) => {
    return choiceScenarioParam.toLowerCase();
}

choiceScenario = idToChoiceScenario(canonicalize(getParameterByName(choiceScenarioQueryParam)))
const props = withMetadata(setPropsByChoiceScenario(choiceScenario))
itemSelection.storeChoiceScenarioProps(props)
document.addEventListener("DOMContentLoaded", () => {
    displayFramingModal(props)
    displayOptions(props)
    if (props.confirmed !== null) {
        itemSelection.confirmItem(props.confirmed)
    }
    try {
        displaySelected();
    } catch (error) {
        console.error(error);
    }
    try {
        displayConfirmed(props)
    } catch (error) {
        console.error(error);
    }
    localize()
});
