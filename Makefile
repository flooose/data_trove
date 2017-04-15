images = img/copy-buddy-128.png\
	img/copy-buddy-48.png\
	img/copy-buddy-16.png\
	img/drawing-1.png

source_files = src/popup.css src/manifest.json  src/popup.html

build : images $(source_files)
	cp $(source_files) copy_buddy/
	babel src -d copy_buddy

test :
	npm test

images :
	convert img/drawing-1.png -background transparent copy_buddy/drawing-1.png
	convert img/drawing-1.png -background transparent -resize 16x16 copy_buddy/copy-buddy-16.png
	convert img/drawing-1.png -background transparent -resize 48x48 copy_buddy/copy-buddy-48.png
	convert img/drawing-1.png -background transparent -resize 128x128 copy_buddy/copy-buddy-128.png

release : build
	rm copy_buddy.zip
	zip -r copy_buddy.zip copy_buddy/

clean :
	rm copy_buddy/*
