<?php

require_once 'common.php';

/**
 * Prints the footer.
 *
 * This function prints the footer, that is almost
 * the same for any page. It consists in a bunch of
 * sections:
 * <dl>
 *		<dt>GitHub source link and version</dt>
 *			<dd>Link to {@link https://github.com GitHub} repository for this website and current version.</dd>
 *		<dt>Powered by</dt>
 *			<dd>websites of software and hardware used in the web page.</dd>
 *		<dt>Author</dt>
 *			<dd>Name and email of autor of the web page.</dd>
 *		<dt>License</dt>
 *			<dd>License under which the web page is released.</dd>
 * </dl>
 * Websites displayed in "Powered by" section are those
 * passed on as arguments, from the third one onwards:
 * these should be valid indexes of the JSON object in
 * footer.json file. By now, however, Raspberry,
 * Apache, MySQL and PHP are always displayed.
 *
 * @param string $repoName Repository name on GitHub.
 * @param string $version Site version.
 * @param mixed[]|varargs $pluginsList Indexes of footer.json file for which a link in "Powereb by" section should be displayed.
 */
function footer($repoName, $version, ...$pluginsList) {
	if (is_array($pluginsList[0]) && count($pluginsList[0]))
		$pluginsList = $pluginsList[0];

	$pluginsDataList = readJSONFile("${_SERVER['DOCUMENT_ROOT']}/util/json/footer.json");

?>
<footer>
	<section>
		<h1>Sorgenti su GitHub e versione</h1>
		<p><a href="https://github.com/Maze055/web-<?php echo $repoName; ?>">Repository GitHub</a>;
			versione <?php echo $version; ?></p>
	</section>
	<section>
		<h1>Powered by:</h1>
		<ul>
			<li>
				<a href="https://www.raspberrypi.org" target="_blank" hreflang="en">
					<img src="/util/img/raspberry.png" alt="Powered by Raspberry PI" />
				</a>
			</li>
			<li>
				<a href="https://httpd.apache.org" target="_blank" hreflang="en">
					<img src="/util/img/apache.gif" alt="Powered by Apache HTTP Server" />
				</a>
			</li>
			<li>
				<a href="https://www.mysql.com" target="_blank" hreflang="en">
					<img src="/util/img/mysql.png" alt="Powered by MySQL" />
				</a>
			</li>
			<li>
				<a href="https://secure.php.net" target="_blank" hreflang="en">
					<img src="/util/img/php.png" alt="Powered by PHP" />
				</a>
			</li>
<?php

	foreach ($pluginsList as $plugin) {
			$pluginData = $pluginsDataList[$plugin];

			echo '<li>';
			if ($pluginData['img'])
				echo <<<BOUND
				<a href="${pluginData['url']}" target="_blank" hreflang="en">
					<img src="/util/img/${pluginData['img']}" alt="Powered by ${pluginData['poweredBy']}" />
				</a>
BOUND;
			else
				echo <<<BOUND
				<a href="${pluginData['url']}" target="_blank" hreflang="en">
					${pluginData['text']}
				</a>
BOUND;
			echo '</li>';
	}

?>
		</ul>
	</section>
	<section>
		<h1>Autore</h1>
		<p>Davide Laezza &lt;<a href="mailto:truzzialrogo@gmx.com">truzzialrogo@gmx.com</a>&gt;</p>
	</section>
	<section>
		<h1>Licenza</h1>
		<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a>This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
	</section>
</footer>
<?php

} // end of footer function
