#FROM ubuntu
#RUN apt-get update
##RUN apt-get install -y git nodejs npm
#RUN git clone git://github.com/DuoSoftware/DVP-CDRProcessor.git /usr/local/src/cdrprocessor
#RUN cd /usr/local/src/cdrprocessor; npm install
#CMD ["nodejs", "/usr/local/src/cdrprocessor/app.js"]

#EXPOSE 8809

FROM node:5.10.0
RUN git clone git://github.com/DuoSoftware/DVP-CDRProcessor.git /usr/local/src/cdrprocessor
RUN cd /usr/local/src/cdrprocessor;
WORKDIR /usr/local/src/cdrprocessor
RUN npm install
EXPOSE 8809
CMD [ "node", "/usr/local/src/cdrprocessor/app.js" ]
