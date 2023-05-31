// Read Running outside of Nodejs to see support for other engines
const { WhatsAppAPI, Handlers, Types } = require("whatsapp-api-js");
const { Text, Media, Contacts } = Types;
const express = require('express')
const app = express();


const Token = "YOUR_TOKEN";

const Whatsapp = new WhatsAppAPI(Token);

// Assuming post is called on a POST request to your server
function post(e) {
    // The Handlers work with any middleware, as long as you pass the correct data
    return Handlers.post(JSON.parse(e.data), onMessage);
}

async function onMessage(phoneID, phone, message, name, raw_data) {
    console.log(`User ${phone} (${name}) sent to bot ${phoneID} ${JSON.stringify(message)}`);

    let promise;

    if (message.type === "text") promise = Whatsapp.sendMessage(phoneID, phone, new Text(`*${name}* said:\n\n${message.text.body}`), message.id);

    if (message.type === "image") promise = Whatsapp.sendMessage(phoneID, phone, new Media.Image(message.image.id, true, `Nice photo, ${name}`));

    if (message.type === "document") promise = Whatsapp.sendMessage(phoneID, phone, new Media.Document(message.document.id, true, undefined, "Our document"));

    if (message.type === "contacts") promise = Whatsapp.sendMessage(phoneID, phone, new Contacts.Contacts(
        [
            new Contacts.Name(name, "First name", "Last name"),
            new Contacts.Phone(phone),
            new Contacts.Birthday("2022", "04", "25"),
        ],
        [
            new Contacts.Name("John", "First name", "Last name"),
            new Contacts.Organization("Company", "Department", "Title"),
            new Contacts.Url("https://www.google.com", "WORK"),
        ]
    ));

    console.log(await promise ?? "There are more types of messages, such as locations, templates, interactives, reactions and all the other media types.");

    Whatsapp.markAsRead(phoneID, message.id);
}

Whatsapp.logSentMessages((phoneID, phone, message, raw_data) => {
    console.log(`Bot ${phoneID} sent to user ${phone} ${JSON.stringify(message)}\n\n${JSON.stringify(raw_data)}`);
});

const server = app.listen(3000, () =>
    console.log(`Server started on ${3000}`)
);