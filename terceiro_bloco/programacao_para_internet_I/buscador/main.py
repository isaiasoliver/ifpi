import re
import requests
from bs4 import BeautifulSoup

from helpers.word import Word
from models.pages import Pages

pages = Pages()
words = Word()

# pages.drop()
# pages.table()

page: str = input('Page: ')
word: str = input('Word: ')
depth: int = int(input('Depth: '))

rpf = pages.filter(
    page=page,
    word=word,
    depth=depth)
if len(rpf) > 0:
    print("#"*50, "Já existe")
    print(rpf)
else:
    register_id: int = pages.insert(
        page=page,
        word=word,
        depth=depth)
    
    if depth == 0:
        r = requests.get(page)
        phrase = words.get_text(
            text=r.text,
            word=word)
        pages.update_by_id(
            id=register_id,
            phrase=phrase)
        
    elif depth == 1:
        response = requests.get(page)
        html = BeautifulSoup(response.text, 'html5lib')
        links = html.find_all('a')
        for link in links:
            if 'https' in link.get('href'):
                r = requests.get(link.get('href'))
                phrase = words.get_text(
                    text=r.text,
                    word=word)
                pages.update_by_id(
                    id=register_id,
                    phrase=phrase)
                print(phrase)
    
    elif depth == 2:
        response = requests.get(page)
        html = BeautifulSoup(response.text, 'html5lib')
        links = html.find_all('a')
        for link in links:
            if 'https' in link.get('href'):
                response = requests.get(link.get('href'))
                html = BeautifulSoup(response.text, 'html5lib')
                links2 = html.find_all('a')
                for l in links2:
                    if 'https' in l.get('href'):
                        r = requests.get(l.get('href'))
                        phrase = words.get_text(
                            text=r.text,
                            word=word)
                        pages.update_by_id(
                            id=register_id,
                            phrase=phrase)
                        print(phrase)
