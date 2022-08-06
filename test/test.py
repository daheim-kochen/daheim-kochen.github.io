import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def url_with_params(choice_scenario):
    return "http://localhost:8000/?surveyID=nowhere&choiceScenario={}&consentNonce=e4c2790346bf4cbca22b961a324094ae&consentSessionID=consent".format(
        choice_scenario)


def result_url_with_params(selected_item, choice_scenario, viewed, count):
    return "https://wiwigoettingen.eu.qualtrics.com/jfe/form/nowhere?SelectedItem={}&ChoiceScenario={}&ConsentSessionID=consent&Viewed={}&Count={}".format(
        selected_item, choice_scenario, viewed, count)


scenario_to_id = {
    "A": "c3c1d9e0",
    "B": "00a78e00",
    "C": "797f316f",
    "D": "332dfc59",
}

scenario_to_framing_text = {
    "A": "Wir haben die leckerste Bratwurst für dich ausgewählt. Guten Appetit!",
    "B": "Wir haben die nachhaltigste Bratwurst für dich ausgewählt. Guten Appetit!",
}

default_sleep_time_sec = 1
default_wait_delay_sec = 20


def has_framing(scenario):
    return scenario in {"A", "B"}


class ChoiceScenarios(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()

    def testSelectDefault(self):
        self.selectDefault("A", "Veggie")
        self.selectDefault("B", "Veggie")
        self.selectDefault("C", "Veggie")
        self.selectDefault("D", "Meat")

    def selectDefault(self, scenario, expected_selection):
        driver = self.driver
        driver.get(url_with_params(scenario_to_id[scenario]))
        self.assertIn("Daheim Kochen", driver.title)

        if has_framing(scenario):
            time.sleep(default_sleep_time_sec)
            actual_framing_text = WebDriverWait(driver, default_wait_delay_sec).until(
                EC.presence_of_element_located((By.ID, "framing-text")))
            self.assertIn(scenario_to_framing_text[scenario], actual_framing_text.text)
            WebDriverWait(driver, default_wait_delay_sec).until(
                EC.element_to_be_clickable((By.ID, "close-framing-modal-button"))).click()

        time.sleep(default_sleep_time_sec)
        WebDriverWait(driver, default_wait_delay_sec).until(
            EC.element_to_be_clickable((By.ID, "checkout-button"))).click()

        time.sleep(default_sleep_time_sec)
        actual_url = driver.current_url
        expected_url = result_url_with_params(expected_selection, scenario, "false", 0)
        self.assertEqual(expected_url, actual_url)

    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    unittest.main()
