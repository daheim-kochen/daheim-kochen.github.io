import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

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
use_localhost = False

def url_with_params(choice_scenario):
    base_url = "https://daheim-kochen.github.io"
    if use_localhost:
        base_url = "http://localhost:8000"
    return "{}/?surveyID=nowhere&choiceScenario={}&consentNonce=e4c2790346bf4cbca22b961a324094ae&consentSessionID=consent".format(
        base_url,
        choice_scenario)


def result_url_with_params(selected_item, choice_scenario, viewed, count):
    return "https://wiwigoettingen.eu.qualtrics.com/jfe/form/nowhere?SelectedItem={}&ChoiceScenario={}&ConsentSessionID=consent&Viewed={}&Count={}".format(
        selected_item, choice_scenario, viewed, count)


def has_framing(scenario):
    return scenario in {"A", "B"}


class ChoiceScenarios(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()

    def testSelectDefaultA(self):
        self.selectDefault("A", "Veggie")

    def testSelectDefaultB(self):
        self.selectDefault("B", "Veggie")

    def testSelectDefaultC(self):
        self.selectDefault("C", "Veggie")

    def testSelectDefaultD(self):
        self.selectDefault("D", "Meat")

    def testOptOutA(self):
        self.optOut("A", "Meat")

    def testOptOutB(self):
        self.optOut("B", "Meat")

    def testOptOutC(self):
        self.optOut("C", "Meat")

    def testOptOutD(self):
        self.optOut("D", "Veggie")

    def selectDefault(self, scenario, expected_selection):
        driver = self.driver
        driver.get(url_with_params(scenario_to_id[scenario]))
        self.assertIn("Daheim Kochen", driver.title)

        if has_framing(scenario):
            self.assertOnFramingAndClose(driver, scenario)

        time.sleep(default_sleep_time_sec)
        WebDriverWait(driver, default_wait_delay_sec).until(
            EC.element_to_be_clickable((By.ID, "checkout-button"))).click()

        time.sleep(default_sleep_time_sec)
        actual_url = driver.current_url
        expected_url = result_url_with_params(expected_selection, scenario, "false", 0)
        self.assertEqual(expected_url, actual_url)

    def optOut(self, scenario, expected_selection):
        driver = self.driver
        driver.get(url_with_params(scenario_to_id[scenario]))
        self.assertIn("Daheim Kochen", driver.title)

        if has_framing(scenario):
            self.assertOnFramingAndClose(driver, scenario)

        time.sleep(default_sleep_time_sec)
        WebDriverWait(driver, default_wait_delay_sec).until(
            EC.element_to_be_clickable((By.ID, "rather-have-link"))).click()

        time.sleep(default_sleep_time_sec)
        WebDriverWait(driver, default_wait_delay_sec).until(
            EC.element_to_be_clickable((By.ID, "option2-button"))).click()

        time.sleep(default_sleep_time_sec)
        WebDriverWait(driver, default_wait_delay_sec).until(
            EC.element_to_be_clickable((By.ID, "save-item-button"))).click()

        time.sleep(default_sleep_time_sec)
        WebDriverWait(driver, default_wait_delay_sec).until(
            EC.element_to_be_clickable((By.ID, "checkout-button"))).click()

        time.sleep(default_sleep_time_sec)
        actual_url = driver.current_url
        expected_url = result_url_with_params(expected_selection, scenario, "true", 1)
        self.assertEqual(expected_url, actual_url)

    def assertOnFramingAndClose(self, driver, scenario):
        time.sleep(default_sleep_time_sec)
        actual_framing_text = WebDriverWait(driver, default_wait_delay_sec).until(
            EC.presence_of_element_located((By.ID, "framing-text")))
        self.assertIn(scenario_to_framing_text[scenario], actual_framing_text.text)
        WebDriverWait(driver, default_wait_delay_sec).until(
            EC.element_to_be_clickable((By.ID, "close-framing-modal-button"))).click()

    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    unittest.main()
