const isPreviewMode = false
const qualtrixUrlPreviewMode = 'https://wiwigoettingen.eu.qualtrics.com/jfe/preview/SV_egGiorwgqpcyPCm?Q_CHL=preview&Q_SurveyVersionID=current&'
const qualtrixUrl = 'https://wiwigoettingen.eu.qualtrics.com/jfe/form/SV_a36JB863LP6ZDBY?'

const option1Selector = "option1"
const option2Selector = "option2"

const choiceScenarioQueryParam = 'choiceScenario';

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
        'veggie-dish-name': 'Spieße mit Pflanzlicher Bratwurst und Zwiebeln',
        'pork-dish-name': 'Spieße mit Schweinebratwurst und Zwiebeln',
        'served-with': 'mit griechischem Orzopastasalat und tomatiger Sauße.',
        'veggie': 'Pflanzliche Bratwurst',
        'meat': 'Schweinebratwurst',
        'hey-there': "Hallo 👋",
        'select-sausage': "Wurstauswahl", // TODO
        'rather-have': "Lieber eine ",
        'preselected-taste': "Wir haben die leckerste Proteinoption für dich ausgewählt. Guten Appetit!",
        'preselected-sust': "Wir haben die nachhaltigste Proteinoption für dich ausgewählt. Guten Appetit!",
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

    const loadSelectedItem = () => {
        selectedItem = JSON.parse(sessionStorage.getItem('selectedItem'))
    };

    const loadConfirmedItem = () => {
        confirmedItem = JSON.parse(sessionStorage.getItem('confirmedItem'))
    };

    if (sessionStorage.getItem("selectedItem") != null) {
        loadSelectedItem()
    }

    if (sessionStorage.getItem("confirmedItem") != null) {
        loadConfirmedItem()
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

    obj.selectedItem = () => selectedItem

    obj.confirmedItem = () => confirmedItem

    obj.storeChoiceScenarioProps = (props) => {
        sessionStorage.setItem('props', JSON.stringify(props))
    }

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
    itemSelection.confirmItem(itemSelection.selectedItem().id)
    displayConfirmed(itemSelection.choiceScenarioProps())
})

$('.open-modal').click(function (_) {
    displaySelected()
})

function toQualtrixUrl(confirmedType, choiceScenario) {
    return getTargetUrl() + toQualtrixParam(confirmedType) + "&" + "ChoiceScenario=" + choiceScenario;
}

$('.checkout').click(function (event) {
    event.preventDefault()
    const confirmedType = getConfirmedType(itemSelection.confirmedItem().id, itemSelection.choiceScenarioProps())
    const choiceScenario = getParameterByName(choiceScenarioQueryParam)
    const win = window.open(toQualtrixUrl(confirmedType, choiceScenario), '_self')
    win.focus()
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
        return qualtrixUrlPreviewMode
    } else {
        return qualtrixUrl
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

    let selectedItemId = itemSelection.selectedItem().id
    displaySelectedButton(selectedItemId)
    displaySelectedCard(selectedItemId)
}

const displayConfirmed = (props) => {
    const confirmedType = getConfirmedType(itemSelection.confirmedItem().id, props)
    const card = document.querySelector('[data-id=menu-card-body]')
    let title = card.querySelector('.card-title');
    let description = card.querySelector('[data-id=menu-description-text]');
    let ratherHave = card.querySelector('[data-id=rather-have-link]');
    if (confirmedType === Type.Veggie) {
        $(title).html(loc("veggie-dish-name"))
        $(description).html(loc("veggie") + " " + loc("served-with"))
        $(ratherHave).html(loc("meat") + "?")
    } else if (confirmedType === Type.Meat) {
        $(title).html(loc("pork-dish-name"))
        $(description).html(loc("meat") + " " + loc("served-with"))
        $(ratherHave).html(loc("veggie") + "?")
    }
}

const loc = tag => translations[locale][tag];

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
    const framingModal = document.querySelector('[data-id=framing-modal]');
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
};

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
};

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
};

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

const setPropsForChoiceScenario = (choiceScenario) => {
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
            console.log("unknown choice scenario")
            return veggieDefaultTasteFraming()
    }
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

choiceScenario = getParameterByName(choiceScenarioQueryParam)
const props = setPropsForChoiceScenario(choiceScenario)
itemSelection.storeChoiceScenarioProps(props)
document.addEventListener("DOMContentLoaded", () => {
    // TODO empty/unknown choice scenario
    displayFramingModal(props)
    displayOptions(props)
    if (props.confirmed !== null) {
        itemSelection.confirmItem(props.confirmed)
    }
    // TODO fix me
    try {
        displaySelected();
    } catch (error) {
        console.error(error);
    }
    // TODO fix me
    try {
        displayConfirmed(props)
    } catch (error) {
        console.error(error);
    }
    localize()
});
