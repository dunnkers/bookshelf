source 'https://rubygems.org'

gem 'goodreads', '~> 0.9.0'
gem 'nokogiri', '~> 1.16'
# goodreads parses Goodreads' XML responses via Hash.from_xml, which needs
# ActiveSupport's XML support explicitly loaded; newer ActiveSupport versions
# (>= 7) dropped the implicit require that made this work standalone.
gem 'activesupport', '~> 6.1'
gem 'rexml'
