library(jsonlite)
library(dplyr)
library(ggplot2)
library(readr)
library(lubridate)

# load source data

claims_02_06 <- read.csv(file="source/claims_2002-2006.csv", header=TRUE, sep=",")
claims_02_06 <- claims_02_06 %>% 
  mutate("Date.Received" = as.Date(Date.Received, format="%d-%b-%y")) %>%
  mutate("Incident.Date" = as.Date(Incident.Date, format="%d/%m/%Y")) %>%
  mutate("Claim.Amount" = parse_number(Claim.Amount)) %>%
  mutate("Close.Amount" = parse_number(Close.Amount)) %>%
  arrange(desc(Close.Amount))

# get types by categories

get_type_stats <- function(source, colName) {
    total <- nrow(source)
    stats <- source %>% 
      group_by_(colName) %>%
      summarise(Count = n(), Rate= signif((Count / total) * 100, digits = 2)) %>%
      arrange(desc(Count))
    return(stats)
}

claim_types <- get_type_stats(claims_02_06, "Claim.Type")
claim_site <- get_type_stats(claims_02_06, "Claim.Site")
statuses <- get_type_stats(claims_02_06, "Status")
dispositions <- get_type_stats(claims_02_06, "Disposition")

ggplot(claim_types, aes(x=Claim.Type, y=Count)) +
  geom_bar(stat="identity", width=0.7) +
  theme(axis.text.x = element_text(angle = 90)) 

ggplot(claim_site, aes(x=Claim.Site, y=Count)) +
  geom_bar(stat="identity", width=0.7) +
  theme(axis.text.x = element_text(angle = 90)) 

ggplot(statuses, aes(x=Status, y=Count)) +
  geom_bar(stat="identity", width=0.7) +
  theme(axis.text.x = element_text(angle = 0)) 

# aggregate claims by month / wday

claims_02_06 <- claims_02_06 %>%
  mutate(Month = month(Incident.Date)) %>%
  mutate(WDay = wday(Incident.Date)) %>%
  mutate(Year = year(Incident.Date)) %>%
  filter(!is.na(WDay))

agregate_by_months <- claims_02_06 %>%
  group_by(Month=floor_date(Incident.Date, "month")) %>%
  summarize(Total=n(), Requested=sum(Claim.Amount, na.rm=TRUE), Close=sum(Close.Amount, na.rm=TRUE)) %>%
  filter(Total > 5) %>%
  mutate(FillColor = ifelse( month(Month) == 1,"red", "grey"))

ggplot(agregate_by_months, aes(x=Month, y=Total, fill=FillColor)) +
  geom_bar(stat="identity") +
  theme(axis.text.x = element_text(angle = 90)) 

aggregate_by_day <- claims_02_06 %>%
  group_by(WDay, Claim.Type) %>%
  summarize(Total=n(), Requested=sum(Claim.Amount, na.rm=TRUE), Close=sum(Close.Amount, na.rm=TRUE))

ggplot(aggregate_by_day, aes(x=WDay, y=Total)) +
  geom_bar(stat="identity") +
  facet_grid(~Claim.Type, scale='free_y') +
  theme(legend.position="none")
