library(jsonlite)
library(dplyr)
library(ggplot2)

claims_02_06 <- read.csv(file="source/claims_2002-2006.csv", header=TRUE, sep=",")

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