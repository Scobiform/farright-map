# FarRight Map Germany #

<img src="https://github.com/Scobiform/farright-map/blob/master/public/favicon.svg" align="right" width="100" alt="FarRight Map Logo">

> A map application that visualizes far-right activities using Next.js and Leaflet.

[![React](https://img.shields.io/badge/React-blue.svg)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-blue.svg)](https://nextjs.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-blue.svg)](https://leafletjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-blue.svg)](https://www.sqlite.org/index.html)
[![AGPL-3.0](https://img.shields.io/badge/License-AGFL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html)


## Table of Contents ##

- [Disclaimer](#disclaimer)
- [Background](#background)
- [Prerequisites](#prerequisites)
- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [Funding](#funding)
- [License](#license)

## Disclaimer ##

All data used in this project was publicly available.

## Background ##

This project is designed to map far-right party-candidates, media, organizations, special locations, fraternities and settlers (yes, Germany has "völkische SIedler*innen"). The data was exclusively collected from open sources and is in public interest.

## Prerequisites ##

To run this project, you need to have the following software installed on your machine:

- [npm](https://www.npmjs.com/)
- [NextJS](https://nextjs.org/)

## Install ##

First, clone the repository or use the following command to create a Next.js app based on this template:

```bash
npx create-next-app -e https://github.com/Scobiform/farright-map
```

## Usage ##

Second, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### API routes can be accessed on ###

- [/api/organization](http://localhost:3000/api/organization)
- [/api/person](http://localhost:3000/api/person)
- [/api/person/1](http://localhost:3000/api/person/1)
- [/api/location](http://localhost:3000/api/location)
- [/api/location?personId=133](http://localhost:3000/api/location?personId=133)
- [/api/location?organizationId=1](http://localhost:3000/api/location?organizationId=1)
- [/api/socialmedia](http://localhost:3000/api/socialmedia)
- [/api/socialmedia/1](http://localhost:3000/api/socialmedia/1)
- [/api/personAttributes?personId=133](http://localhost:3000/api/personAttributes?personId=133)

## Maintainers ##

[@Scobiform](https://github.com/Scobiform/)

## Contributing ##

Feel free to contribute to this project. You can find more information on how to contribute in the following links:

- [Project Kanban Board](https://github.com/users/Scobiform/projects/8)
- [Discussions](https://github.com/Scobiform/farright-map/discussions)
- [Issues](https://github.com/Scobiform/farright-map/issues)

## Funding ##

The [FarRight Map](https://github.com/Scobiform/farright-map) is an initiative to make far-right networks in Germany visible. With your support, we can continue developing and updating the map with new data, raising awareness about far-right structures, and strengthening democratic processes.

Every contribution—no matter the size—helps keep this project going. Your donation will help fund essential research, data collection, and further development of the tool.

You can support us through [GitHub Sponsors](https://github.com/sponsors/Scobiform) or via [PayPal](https://paypal.me/kompromat).

Thank you for your support!

## License ##

- [AGPL-3.0 © ](
https://www.gnu.org/licenses/agpl-3.0.html)
