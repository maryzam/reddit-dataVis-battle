
library(dplyr)

library(tidyr)
library(tidytext)

library(readr)
library(jsonlite)

library(ggplot2)

# load all lines from the source file

rawData <- read.csv(file="./the-office-lines.csv", header=TRUE, sep=",", encoding="UTF-8")
names(rawData)

# detect core charactes 

speakers <- rawData %>%
  group_by(speaker) %>% 
  summarise(count = n()) %>% 
  arrange(desc(count))

mainCharacters <- speakers[0:12,]$speaker
head(mainCharacters)

# get only lines of the core team and not deleted

lines <- rawData %>% 
  filter(!deleted) 

lines$deleted <- NULL

lines$line_text <- gsub("\\[[^\\]]*\\]", "", lines$line_text, perl=TRUE)
names(lines)[names(lines)=="id"] <- "line"

head(lines)

# count lines per character 

totalLinesPerSeason <- lines %>% group_by(season) %>% count()
linesPerSpeaker <- lines %>% 
                      group_by(speaker, season) %>%
                        count() %>%
                        left_join(totalLinesPerSeason, by="season") %>%
                        mutate(freq = 100 * (n.x / n.y)) %>%
                        ungroup() %>%
                      group_by(speaker) %>%
                        summarise(lines = mean(freq)) %>%
                        arrange(desc(lines))

linesPerSpeaker %>% 
  filter(speaker %in% mainCharacters) %>%
  toJSON(pretty = TRUE) %>%
  write_lines("./jsons/linesPerSpeaker.json")

# flaten the data

tidyData <- lines %>% unnest_tokens(word, line_text);

tidyData <- tidyData %>% anti_join(stop_words)

# top words

topWords <- tidyData %>% count(word, sort = TRUE) %>% top_n(50)
topWords %>% 
  toJSON(pretty = TRUE) %>%
  write_lines("./jsons/topWords.json")

wordsPerLine <- tidyData %>% 
                  group_by(speaker, line) %>%
                  count(sort=TRUE) %>%
                    group_by(speaker) %>%
                    summarise(avg = mean(n), median=median(n)) %>%
                    arrange(desc(avg))

wordsPerLine %>% 
  filter(speaker %in% mainCharacters) %>%
  toJSON(pretty = TRUE) %>%
  write_lines("./jsons/wordsPerLine.json")

distinctWords <- tidyData %>% 
                    group_by(speaker, word) %>%
                    count(word, sort=TRUE) %>% 
                    summarise(total=sum(n), distinct = n_distinct(word)) %>%
                    mutate(freq =  100 *(distinct / total)) %>%
                    arrange(desc(distinct))

distinctWords %>% 
  filter(speaker %in% mainCharacters) %>%
  toJSON(pretty = TRUE) %>%
  write_lines("./jsons/distinctWords.json")


# detect most identifying words by charactes (overall)
total <- tidyData %>% count() %>% as.integer(n)

idfs <- tidyData %>%
          group_by(speaker) %>%
          count(sort=TRUE) %>%
          ungroup() %>%
          mutate(idf = log(1 + total / n))

dwf <- tidyData %>%
            group_by(word) %>%
            count(sort=TRUE) %>%
            ungroup()

dwfPerHero <- tidyData %>%
                group_by(speaker, word) %>%
                  filter(speaker %in% mainCharacters) %>%
                  count(sort=TRUE) %>%
                  ungroup() %>%
                  filter(n > 3) %>%
                left_join(wf, by="word") %>%
                  mutate(tf = n.x * n.x / n.y) %>%
                left_join(idfs, by="speaker") %>%
                  mutate(tf_idf = tf * idf) %>%
                group_by(speaker) %>%
                  top_n(15, tf_idf) %>%
                  ungroup() %>%
                arrange(word)

sharedWords <- dwfPerHero %>% 
                 group_by(word) %>%
                 count() %>%
                 filter(nn > 1) %>%
                 arrange(desc(nn)) 

sharedWords <- sharedWords$word

dwfPerHero <- dwfPerHero %>% 
                filter(!(word %in% sharedWords)) %>% 
                arrange(desc(tf_idf)) %>%
                group_by(speaker) %>%
                top_n(7) %>%
                summarize(words = paste(word, collapse=","))
                

dwfPerHero %>% 
  toJSON(pretty = TRUE) %>%
  write_lines("./jsons/identifyingWords.json")

# Sentimental analysis by characters

#now we can left only top characters

bySeasons <- tidyData %>%
  filter(speaker %in% mainCharacters) %>%
  inner_join(get_sentiments("afinn")) %>%
  group_by(season, speaker) %>%
  summarise(sentiment = sum(score)) %>%
  ungroup()

ggplot(bySeasons, aes(season, sentiment, fill = speaker)) +
  geom_bar(stat = "identity") +
  facet_wrap(~speaker)

bySeasons %>%
  toJSON(pretty = TRUE) %>%
  write_lines("./jsons/sentimentalsBySeason.json")

# Most common positive & negative

top_sentimental <- tidyData %>%
  inner_join(get_sentiments("bing")) %>%
  count(word, sentiment, sort = TRUE) %>%
  ungroup() %>%
  top_n(50)

top_sentimental %>%
  toJSON(pretty = TRUE) %>%
  write_lines("./jsons/topSentimental.json")

# Most common positive & negative by characters

top_by_characters <- tidyData %>%
    filter(speaker %in% mainCharacters) %>%
    inner_join(get_sentiments("bing")) %>%
    count(speaker, word, sentiment, sort = TRUE) %>%
    group_by(speaker) %>%
      top_n(10, n) %>%
      ungroup() %>%
    mutate(n = ifelse(sentiment == "negative", -n, n)) %>%
    arrange(speaker, desc(n))

top_by_characters %>%
  toJSON(pretty = TRUE) %>%
  write_lines("./jsons/topPositiveNegativeByHeroes.json")

  # go deeper into sentiments 
  
  hero_sentiments <- tidyData %>%
    filter(speaker %in% mainCharacters) %>%
    inner_join(get_sentiments("nrc")) %>%
    filter(!(sentiment %in% c("positive", "negative")))
  
  total <- hero_sentiments %>%
    group_by(speaker) %>%
    count()
  
  hero_sentiments <- hero_sentiments %>%
    inner_join(total, by="speaker") %>%
    group_by(speaker, sentiment, n) %>%
    summarise(frac = n()) %>% ungroup() %>%
    mutate(frac = 100*(frac / n)) %>%
    arrange(speaker, desc(frac))
  
  hero_sentiments %>%
    toJSON(pretty = TRUE) %>%
    write_lines("./jsons/topSentimentsByHeroes.json")
  
  
  
    



