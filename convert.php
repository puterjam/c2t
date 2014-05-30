<?php
if (isset($_POST["data"]))
{
	$imageData=$_POST["data"];
	//echo($imageData);
	//die();

	$filteredData = substr($imageData, strpos($imageData, ",")+1);

	$unencodedData = base64_decode($filteredData);
	
	$inImage = imagecreatefromstring($unencodedData);
	
	$filename = str_replace(array("\r\n", "\n", "\r"),"",$_POST["filename"]?$_POST["filename"]:"publish");
	
	header('Content-type: application/force-download');
	header('Content-Transfer-Encoding: Binary');

	if ($inImage != false && $_POST["type"] == "8") {
		header('Content-disposition: attachment; filename='.$filename.'.8.png');
		
		$outImage = imagecreate(imagesx($inImage), imagesy($inImage));
		imagecopy($outImage, $inImage, 0, 0, 0, 0, imagesx($inImage), imagesy($inImage));
		
		//返回真正的255色板
		$outImage = ImageTrueColorToPalette2($outImage,false,255);
		
		imagepng($outImage);
		imagedestroy($outImage);
	}else{
		header('Content-disposition: attachment; filename='.$filename.'.32.png');
		echo($unencodedData);
	}
	imagedestroy($inImage);
}else{
	echo("非法数据");
}

function ImageTrueColorToPalette2($image, $dither, $ncolors) {
    $width = imagesx( $image );
    $height = imagesy( $image );
    $colors_handle = ImageCreateTrueColor( $width, $height );
    ImageCopyMerge( $colors_handle, $image, 0, 0, 0, 0, $width, $height, 100 );
    ImageTrueColorToPalette( $image, $dither, $ncolors );
    ImageColorMatch( $colors_handle, $image );
    ImageDestroy($colors_handle);
    return $image;
}
?>