testCoverage
==============

About
--------------

Author: test



Build dependencies
--------------

In order to build your generated Composer project from its source, you will need PHP on the command line.

So, you must install PHP5 on your system on your command line. Test it:

```
php --help
```

Install composer locally

```
curl -sS https://getcomposer.org/installer | php
```

Then, you can install PhpDocumentor, PhpUnit and PhpCPD locally. Just run once:

```
php composer.phar install -v
```

Finally, you should also install the PHP extension named Xdebug, which will be used by PhpUnit for code coverage.


Build the sources
--------------

Once all your dependencies are installed, you can build your project with:

```
vendor/bin/phpcpd src/
```

And run tests with coverage generation with:

```
vendor/bin/phpunit
```
