Name:       Modello_Multimediaplayer
Summary:    A proof of concept pure html5 UI
Version:    0.0.2
Release:    1
Group:      Applications/System
License:    Apache 2.0
URL:        http://www.tizen.org
Source0:    %{name}-%{version}.tar.bz2
BuildRequires:  zip
Requires:   Modello_Common
Requires:   wrt-plugins-ivi
Requires:   wrt-plugins-tizen-bt

%description
A proof of concept pure html5 UI

%prep
%setup -q -n %{name}-%{version}

%build

make wgtPkg

%install
rm -rf %{buildroot}
%make_install

%files
%defattr(-,root,root,-)
/opt/usr/apps/.preinstallWidgets/Modello_Multimediaplayer.wgt
