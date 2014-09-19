I just got my first web hook set up.

I will say, it was a huge pain in the butt, but mostly because PHP is awful.

If you're not familiar with it already, it works like this. GitHub will post data to any URL you want, based on nearly any of the events that can happen to a repo. The most significant of those, of course, is a push, which signifies that the code is ready for update in production.

What better way is there to update my site than to have GitHub trigger a copy of the changed files? None! :)

So, long story short, I wrote this script:

    // A simple script to update the changed files when updates are made
    // to the GitHub repo associated with this site.
    
    $githubUrl = 'https://raw.githubusercontent.com/huttj/new-site/master/';
    $inputJSON = file_get_contents('php://input');
    $pushData = json_decode( $inputJSON, TRUE );
    
    $commits = $pushData['commits'];
    
    $changedFiles = array();
    $removedFiles = array();
    
    // Collect all of the changed/new and removed files from each
    // of the pushed commits
    for ($i = 0; $i < count($commits); $i++) {
    
         for ($j = 0; $j < count($commits[$i]['added']); $j++) {
              $changedFiles[] = $commits[$i]['added'][$j];
         }
         
         for ($k = 0; $k < count($commits[$i]['modified']); $k++) {
              $changedFiles[] = $commits[$i]['modified'][$k];
         }
         
         for ($l = 0; $l < count($commits[$i]['removed']); $l++) {
              $removedFiles[] = $commits[$i]['removed'][$l];
         }
    }
    
    // For each of the changes, copy the file from the master repo
    for ($i = 0; $i < count($changedFiles); $i++) {
    
        // If the file is part of a subdirectory, make sure the
        // path on the server
        if (count(explode('/', $changedFiles[$i])) > 1) {
           
            $the_file = explode('/', $changedFiles[$i]);
            $path = '';
    
        // Traverse the path, creating directories as needed        
            for ($j = 0; $j < count($the_file) - 1; $j++) {
                 if (!file_exists($path . $the_file[$j])) {
                     mkdir($path . $the_file[$j]);
                 }
                 $path = $path . $the_file[$j] . '/';
            }
        }
    
        // copy() will not work; allow_url_fopen is off
        // copy($githubUrl . $changedFiles[$i], $changedFiles[$i]);
        
        // Set the output stream, and the source url
        $out = fopen($changedFiles[$i],"wb");   
        $url = $githubUrl . $changedFiles[$i];
        
    
        // Curls for the girls! Er...    
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_FILE, $out); 
        curl_setopt($ch, CURLOPT_HEADER, 0); 
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_exec($ch);
        curl_close($ch);
    }
    
    for ($i=0; $i < count($removedFiles); $i++) {
        unlink($removedFiles[$i]);
    }
    
    // ToDo: Error handling and proper updated list
    if (strlen(implode(', ', $changedFiles))>0) {
        echo 'Files updated/added: ' . implode(', ', $changedFiles) . ' ';
    }
    if (strlen(implode(', ', $removedFiles))>0) {
        echo 'Files removed/added: ' . implode(', ', $removedFiles);
    }

It takes the output from one of GitHub's posts, finds the updated files, and cURLs them into the appropriate locations. A bit rudimentary, but it works.

I feel like this would be way easier if I was using a proper VPS. I could just trigger a pull through the command line.