import requests
from bs4 import BeautifulSoup

from models.pages import Pages


site: str = input('Site de pesquisa: ')
Pages().insert(url=site)
response = requests.get(site)

palavra = input('Pesquise aqui: ')
index = response.text.rfind(palavra)
print(response.text[index])

html = BeautifulSoup(response.text, 'html5lib')
links = html.find_all('a')