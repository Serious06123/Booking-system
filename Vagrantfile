Vagrant.configure("2") do |config|
  # Máy Master
  config.vm.define "master" do |master|
    master.vm.box = "ubuntu/jammy64"
    master.vm.network "private_network", ip: "192.168.56.10"
    master.vm.hostname = "k8s-master"
    master.vm.provider "virtualbox" do |vb|
      vb.memory = "2048"
      vb.cpus = 2
    end
  end

  # Máy Worker 
  config.vm.define "worker" do |worker|
    worker.vm.box = "ubuntu/jammy64"
    worker.vm.network "private_network", ip: "192.168.56.11"
    worker.vm.hostname = "k8s-worker"
    worker.vm.provider "virtualbox" do |vb|
      vb.memory = "4096"
      vb.cpus = 2
    end
  end
end