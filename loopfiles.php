<?php 
	
	function getDirContents($dir, &$results = array()){
		$files = scandir($dir);

		foreach($files as $key => $value){
			$path = realpath($dir.DIRECTORY_SEPARATOR.$value);
			if(!is_dir($path)) {
				$results[] = $path;
			} else if($value != "." && $value != "..") {
				getDirContents($path, $results);
			}
		}

		return $results;
	}
	
	$files = getDirContents(getcwd());
	
	echo count($files) . "<br />";	

	foreach($files as $file){
		echo "'." . str_replace('\\', '/', str_replace(getcwd(), "", $file)) . "'," . "<br />";
	}
	
?>