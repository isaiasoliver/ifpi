import requests
from bs4 import BeautifulSoup

response = requests.get('https://g1.globo.com/')
# print(response.text.find('chuva'))


html = BeautifulSoup(response.text, 'html5lib')
links = html.find_all('a')

ranking = {}
for link in links:
    if link.get('href'):
        split = link['href'].split('https://g1.globo.com/')
        if len(split) > 1:

            if split[1].split('/')[0] not in ranking:
                ranking[split[1].split('/')[0]]=1
            else:
                ranking[split[1].split('/')[0]]+=1

print(ranking)