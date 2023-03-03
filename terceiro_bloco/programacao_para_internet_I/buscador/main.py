import requests
from bs4 import BeautifulSoup

from models.pages import Pages

pages = Pages()

page: str = input('Page: ')
word: str = input('Word: ')
depth: int = int(input('Depth: '))

rpf = pages.filter(
    page=page,
    word=word,
    depth=depth)
if len(rpf) > 0:
    print("#"*100, "Já existe")
else:
    pages.insert(
        page=page,
        word=word,
        depth=depth)
    
    if depth == 0:
        response = requests.get(page)
        index = response.text.rfind(word)
        print(response.text[index])
    elif depth == 1:
        response = requests.get(page)
        html = BeautifulSoup(response.text, 'html5lib')
        links = html.find_all('a')
        ranking = {}
        for link in links:
            print(link.get('href'))
        #     if link.get('href'):
        #         split = link['href'].split('https://g1.globo.com/')
        #         if len(split) > 1:
        #             if split[1].split('/')[0] not in ranking:
        #                 ranking[split[1].split('/')[0]]=1
        #             else:
        #                 ranking[split[1].split('/')[0]]+=1

        # print(ranking)
    elif depth == 2:
        response = requests.get(page)
        html = BeautifulSoup(response.text, 'html5lib')
        links = html.find_all('a')
        ranking = {}
        for link in links:
            response = requests.get(link.get('href'))
            html = BeautifulSoup(response.text, 'html5lib')
            links2 = html.find_all('a')
            for l in links2:
                print(l.get('href'))
