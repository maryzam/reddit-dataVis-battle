
library(dplyr)
library(syuzhet)
library(ggplot2)

# load all lines from the source file

rawData <- read.csv(file="./the-office-lines.csv", header=TRUE, sep=",")
names(rawData)

# detect core charactes 

speakers <- rawData %>%
              group_by(speaker) %>% 
              summarise(count = n()) %>% 
              arrange(desc(count))

mainCharacters <- speakers[0:25,]
head(mainCharacters)

# get only lines of the core team and not deleted

lines <- rawData %>% 
            filter(!deleted) %>% 
            filter(speaker %in% mainCharacters$speaker)
count(lines)

# Sentimental analysis
bySeasons <- lines %>%
            group_by(speaker, season) %>% 
            summarise(line_text = paste(line_text, collapse=" ")) %>%
            ungroup()

bySeasons$sentiment <- get_sentiment(bySeasons$line_text, method="nrc") %>% as.numeric()

bySeasons %>%
  ggplot(aes(season, sentiment, color = speaker)) +
    geom_line(size = 1) + 
    scale_x_continuous(name = "\nSeason", breaks = seq(0, 10, by=1)) +
    scale_y_continuous(name = "Sentiment\n", breaks = seq(-100, 50, by=50)) +
    facet_wrap(~ speaker)



# Sentimental analysis by Episodes

byEpisodes <- lines %>%
  group_by(speaker, season, episode) %>% 
  summarise(line_text = paste(line_text, collapse=" ")) %>%
  ungroup()

byEpisodes$sentiment <- get_sentiment(byEpisodes$line_text, method="nrc") %>% as.numeric()
byEpisodes$order <- (byEpisodes$season * 100 + byEpisodes$episode)
byEpisodes <- byEpisodes %>% arrange(season, episode)
byEpisodes$idu <- as.numeric(row.names(byEpisodes))

byEpisodes %>%
  ggplot(aes(idu, sentiment, color = speaker)) +
  geom_line() + 
  scale_x_continuous(name = "\nEpisode", breaks = NULL) +
  scale_y_continuous(name = "Sentiment\n", breaks = seq(-30, 50, by=10)) +
  facet_wrap(~ speaker)




