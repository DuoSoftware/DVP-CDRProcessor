FROM ubuntu
RUN apt-get update
RUN apt-get install -y git nodejs npm
RUN git clone git://github.com/DuoSoftware/DVP-CDRProcessor.git /usr/local/src/cdrprocessor
RUN cd /usr/local/src/cdrprocessor; npm install
CMD ["nodejs", "/usr/local/src/cdrprocessor/app.js"]

EXPOSE 8809