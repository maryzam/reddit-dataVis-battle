# Load Libraries, declare constants, Set working directory
# setwd("C:/Users/Sam/Documents/GitHub/reddit-dataVis-battle/June/data")
library(tidyverse)
library(lubridate)
library(dplyr)

# Load data. Note that certain cells will need formatting for
# compatibility with ISO-8601 and R.
emperors <- read_csv("emperors.csv")
emperors$birth<-ymd(emperors$birth)
emperors$death<-ymd(emperors$death)
emperors$reign.start<-ymd(emperors$reign.start)
emperors$reign.end<-ymd(emperors$reign.end)
emperors$birth[1]<-emperors$birth[1] - 2*years(62)              # Inverting date sign. See emperors$notes[1]
emperors$reign.start[1]<-emperors$reign.start[1] - 2*years(26)  # Inverting date sign. See emperors$notes[1]
emperors$birth[2]<-emperors$birth[2] - 2*years(41)              # Inverting date sign. See emperors$notes[2]
emperors$birth[4]<-emperors$birth[4] - 2*years(9)               # Inverting date sign. See emperors$notes[4]
emperors$birth[6]<-emperors$birth[6] - 2*years(2)               # Inverting date sign. See emperors$notes[6]

emperors$age.reign.start <- (emperors$reign.start - emperors$birth)
emperors$age.reign.end <- (emperors$reign.end - emperors$birth)
emperors$age.death <- (emperors$death - emperors$birth)
emperors$reign.duration <- (emperors$reign.end - emperors$reign.start)
emperors$death.till <- (emperors$death - emperors$reign.start)

emperors$birth.year <- format(emperors$birth, "%y AD") 
emperors$death.year <- format(emperors$death, "%%y AD") 
emperors$reign.start <-  format(emperors$reign.start, "%B %d, %y AD")
emperors$reign.end <- format(emperors$reign.end, "%B %d, %y AD") 

write.csv(emperors, file = "emperors.v3.csv")