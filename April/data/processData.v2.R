
library(dplyr)
library(tidyr)
library(tidytext)
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

lines$line_text <- gsub("\\[[^\\]]*\\]", "", lines$line_text, perl=TRUE)

# flaten the data

tidyData <- lines %>% unnest_tokens(word, line_text);
tidyData$scene <- NULL
tidyData$deleted <- NULL
tidyData$id <- NULL

tidyData <- tidyData %>% anti_join(stop_words)
tidyData %>% count(word, sort = TRUE) 


# Sentimental analysis by characters

bySeasons <- tidyData %>%
  inner_join(get_sentiments("bing")) %>%
  count(speaker, season, sentiment) %>%
  spread(sentiment, n, fill = 0) %>%
  mutate(sentiment = positive - negative)

ggplot(bySeasons, aes(season, sentiment, fill = speaker)) +
  geom_bar(stat = "identity", show.legend = FALSE) +
  facet_wrap(~speaker)

bySeasons <- tidyData %>%
  inner_join(get_sentiments("afinn")) %>%
  group_by(speaker, season) %>%
  summarise(sentiment = sum(score)) %>%
  count(speaker, season, sentiment) 

ggplot(bySeasons, aes(season, sentiment, fill = speaker)) +
  geom_bar(stat = "identity", show.legend = FALSE) +
  facet_wrap(~speaker)

# Most common positive & negative

for (sp in mainCharacters$speaker) {
  bing_word_counts <- tidyData %>%
    filter(speaker == sp)%>%
    inner_join(get_sentiments("bing")) %>%
    count(word, sentiment, sort = TRUE) %>%
    ungroup()
  
  plot <- bing_word_counts %>%
    top_n(15) %>%
    mutate(n = ifelse(sentiment == "negative", -n, n)) %>%
    mutate(word = reorder(word, n)) %>%
    ggplot(aes(word, n, fill = sentiment)) +
    geom_bar(stat = "identity") +
    coord_flip() +
    labs(y = cat("Contribution to sentiment :: ", sp))
  
  ggsave(plot, file=paste(sp, ".png", sep=''), scale=2)
  
  #print(plot)
}



