# Slack Incident Bot

## Getting Started

In Slack:
- Create a new Custom Integration -> Bot configuration
- Record the API Token and the username you configured
- Invite the bot to a channel in Slack

```sh
> git clone https://github.com/seikho/slack-incident-bot && cd slack-incident-bot

# From the command line:
> yarn
> yarn build
> export SLACK_TOKEN={API TOKEN} yarn start

# Using Docker:
> docker build -t incident .
> docker run -dt --env SLACK_TOKEN={API TOKEN} --name incidentbot --restart=always incident
```


To get started with the bot in Slack:
- Message the bot directly with `@username help`
- Or in any channel the bot is in: `@username help`

## License

MIT
