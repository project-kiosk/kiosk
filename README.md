# kiosk
Kiosk is a simple web application to manage, read and download your ebooks.

## Requirements
Kiosk uses [Redis](https://redis.io/) to store the ebook meta data. The ebooks itself are stored on the filesystem.

## Usage

Clone the repository:

    git clone https://github.com/Radiergummi/kiosk

Install the dependencies:

    npm install

Start the application:

    npm start

Visit the following URL in your browser: [localhost:3000](http://localhost:3000). Welcome to Kiosk.

## Screenshots, features, etc
See [here](https://radiergummi.github.io/kiosk/).

## Current state of development
I made Kiosk a while ago to solve a specific problem: Having to manage an ebook library for my family. The goal was to have an easy interface anyone here could upload, view and edit his ebooks and later download them on their reader.  
Since then, I haven't had much time and there is still much left to do. The application works, but all strings in the interface are in German, there are some bugs to iron out and the ebook meta data parsing could be more reliable. Design wise, there's also room for improvement.  

Therefore, if this project seems interesting to you or possibly solves the same problem for you, I'd be happy if you could participate in Kiosk by creating pull requests or filing issues. Thank you!
